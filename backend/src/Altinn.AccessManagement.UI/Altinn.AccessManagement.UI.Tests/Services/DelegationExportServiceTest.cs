using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.DelegationExport;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Moq;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Tests.Services
{
    /// <summary>
    /// Unit tests for <see cref="DelegationExportService"/>, focused on how backend calls are fanned out.
    /// </summary>
    public class DelegationExportServiceTest
    {
        // Mirrors DelegationExportService.MaxConcurrentRequestsPerType.
        private const int Limit = 8;
        private const string MainOrgNumber = "100000001";
        private static readonly TimeSpan WaitTimeout = TimeSpan.FromSeconds(10);

        private readonly Mock<IUserService> _userService = new();
        private readonly Mock<IRoleService> _roleService = new();
        private readonly Mock<IAccessPackageService> _accessPackageService = new();
        private readonly Mock<ISingleRightService> _singleRightService = new();
        private readonly Mock<IInstanceService> _instanceService = new();
        private readonly DelegationExportService _service;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationExportServiceTest"/> class.
        /// </summary>
        public DelegationExportServiceTest()
        {
            _roleService.Setup(r => r.GetAllRoles(It.IsAny<string>())).ReturnsAsync(Enumerable.Empty<RoleMetadata>());
            _accessPackageService.Setup(a => a.GetSearch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(new List<AccessAreaFE>());

            _service = new DelegationExportService(
                _userService.Object,
                _roleService.Object,
                _accessPackageService.Object,
                _singleRightService.Object,
                _instanceService.Object);
        }

        [Fact]
        public async Task Export_FansOutGiverCallsUpToLimit()
        {
            AuthorizedParty reportee = ArrangeReportee(subunits: 20);
            var roleGate = new Gate<List<RolePermission>>();
            _roleService
                .Setup(r => r.GetRolePermissions(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>()))
                .Returns(() => roleGate.Next());

            Task<DelegationExportResult> export = _service.ExportReporteeDelegations(reportee.PartyUuid, true, new HashSet<string> { "roles" }, "nb");

            // Exactly `Limit` giver calls are in flight while none of them has completed.
            await WaitUntilAsync(() => roleGate.Started == Limit, "first wave of role calls");
            await Task.Delay(100);
            Assert.Equal(Limit, roleGate.Started);
            Assert.False(export.IsCompleted);

            // Completing one call frees one slot.
            Assert.True(roleGate.ReleaseOne(new List<RolePermission>()));
            await WaitUntilAsync(() => roleGate.Started == Limit + 1, "next role call after a slot was freed");

            await roleGate.ReleaseUntilCompletedAsync(export, new List<RolePermission>());
            DelegationExportResult result = await export;

            Assert.Equal(DelegationExportStatus.Ok, result.Status);
            _roleService.Verify(r => r.GetRolePermissions(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>()), Times.Exactly(21));
        }

        [Fact]
        public async Task Export_RunsRightTypesConcurrently()
        {
            AuthorizedParty reportee = ArrangeReportee(subunits: 0);
            var roleGate = new Gate<List<RolePermission>>();
            var instanceGate = new Gate<List<InstanceDelegation>>();
            _roleService
                .Setup(r => r.GetRolePermissions(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>()))
                .Returns(() => roleGate.Next());
            _instanceService
                .Setup(i => i.GetDelegatedInstances(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string>(), false))
                .Returns(() => instanceGate.Next());

            Task<DelegationExportResult> export = _service.ExportReporteeDelegations(reportee.PartyUuid, false, new HashSet<string> { "roles", "instances" }, "nb");

            // Both types have issued their backend call before either of them has completed.
            await WaitUntilAsync(() => roleGate.Started == 1 && instanceGate.Started == 1, "role and instance calls started");
            Assert.False(export.IsCompleted);

            roleGate.ReleaseOne(new List<RolePermission>());
            instanceGate.ReleaseOne(new List<InstanceDelegation>());
            DelegationExportResult result = await export;

            Assert.Equal(DelegationExportStatus.Ok, result.Status);
            Dictionary<string, string> entries = ReadZipEntries(result.Content);
            Assert.Equal(new[] { "roller.csv", "enkelttjenester-instans.csv" }, entries.Keys);
        }

        [Fact]
        public async Task Export_KeepsRowsInGiverOrder_WhenCallsCompleteInReverse()
        {
            AuthorizedParty reportee = ArrangeReportee(subunits: 2);
            var pending = new ConcurrentDictionary<Guid, TaskCompletionSource<List<RolePermission>>>();
            _roleService
                .Setup(r => r.GetRolePermissions(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>()))
                .Returns((Guid party, Guid? from, Guid? to, string language) =>
                    pending.GetOrAdd(party, _ => new TaskCompletionSource<List<RolePermission>>(TaskCreationOptions.RunContinuationsAsynchronously)).Task);

            Task<DelegationExportResult> export = _service.ExportReporteeDelegations(reportee.PartyUuid, true, new HashSet<string> { "roles" }, "nb");
            await WaitUntilAsync(() => pending.Count == 3, "all three giver calls started");

            // Complete subunit 2, then subunit 1, then the main unit.
            pending[reportee.Subunits[1].PartyUuid].SetResult(new List<RolePermission> { DirectRolePermission("DAGL") });
            pending[reportee.Subunits[0].PartyUuid].SetResult(new List<RolePermission> { DirectRolePermission("DAGL") });
            pending[reportee.PartyUuid].SetResult(new List<RolePermission> { DirectRolePermission("DAGL") });

            DelegationExportResult result = await export;
            string csv = ReadZipEntries(result.Content)["roller.csv"];

            string[] dataRows = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries).Skip(1).ToArray();
            Assert.Equal(3, dataRows.Length);
            Assert.StartsWith(reportee.OrganizationNumber + ";", dataRows[0]);
            Assert.StartsWith(reportee.Subunits[0].OrganizationNumber + ";", dataRows[1]);
            Assert.StartsWith(reportee.Subunits[1].OrganizationNumber + ";", dataRows[2]);
        }

        [Theory]
        [InlineData("roles", "Role")]
        [InlineData("accesspackages", "AccessPackage")]
        [InlineData("singlerights", "SingleRights")]
        [InlineData("instances", "Instances")]
        public async Task Export_TagsBackendHttpStatusExceptionWithOrigin(string type, string expectedTitle)
        {
            AuthorizedParty reportee = ArrangeReportee(subunits: 0);
            var backendError = new HttpStatusException("BackendError", "Downstream", HttpStatusCode.NotFound, "trace-1", "backend says no");
            _roleService
                .Setup(r => r.GetRolePermissions(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>()))
                .ThrowsAsync(backendError);
            _accessPackageService
                .Setup(a => a.GetDelegations(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>()))
                .ThrowsAsync(backendError);
            _singleRightService
                .Setup(s => s.GetDelegatedResources(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid?>()))
                .ThrowsAsync(backendError);
            _instanceService
                .Setup(i => i.GetDelegatedInstances(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string>(), false))
                .ThrowsAsync(backendError);

            HttpStatusException thrown = await Assert.ThrowsAsync<HttpStatusException>(
                () => _service.ExportReporteeDelegations(reportee.PartyUuid, false, new HashSet<string> { type }, "nb"));

            Assert.Equal(expectedTitle, thrown.Title);
            Assert.Equal(HttpStatusCode.NotFound, thrown.StatusCode);
            Assert.Equal("trace-1", thrown.TraceId);
            Assert.Equal("backend says no", thrown.Message);
        }

        [Fact]
        public async Task Export_StopsStartingCallsInOtherTypes_WhenOneTypeFails()
        {
            AuthorizedParty reportee = ArrangeReportee(subunits: 20);
            var roleGate = new Gate<List<RolePermission>>();
            var instanceGate = new Gate<List<InstanceDelegation>>();
            _roleService
                .Setup(r => r.GetRolePermissions(It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>()))
                .Returns(() => roleGate.Next());
            _instanceService
                .Setup(i => i.GetDelegatedInstances(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string>(), false))
                .Returns(() => instanceGate.Next());

            Task<DelegationExportResult> export = _service.ExportReporteeDelegations(reportee.PartyUuid, true, new HashSet<string> { "roles", "instances" }, "nb");
            await WaitUntilAsync(() => roleGate.Started == Limit && instanceGate.Started == Limit, "first wave of role and instance calls");

            // Every in-flight instance call fails; the export must then stop issuing new role calls.
            instanceGate.FailAll(new HttpStatusException("BackendError", "Downstream", HttpStatusCode.BadGateway, "trace-2", "instances down"));
            // Give the cancellation a generous window to propagate to the role fan-out before releasing its calls.
            await Task.Delay(500);

            await roleGate.ReleaseUntilCompletedAsync(export, new List<RolePermission>());
            HttpStatusException thrown = await Assert.ThrowsAsync<HttpStatusException>(() => export);

            Assert.Equal("Instances", thrown.Title);
            Assert.Equal(HttpStatusCode.BadGateway, thrown.StatusCode);
            Assert.True(roleGate.Started <= Limit + 1, $"Expected no new role calls after the instance failure, but {roleGate.Started} of 21 were started.");
        }

        [Fact]
        public async Task Export_UsesInstanceOverloadWithoutDialogLookup()
        {
            AuthorizedParty reportee = ArrangeReportee(subunits: 0);

            DelegationExportResult result = await _service.ExportReporteeDelegations(reportee.PartyUuid, false, new HashSet<string> { "instances" }, "nb");

            Assert.Equal(DelegationExportStatus.Ok, result.Status);
            _instanceService.Verify(
                i => i.GetDelegatedInstances("nb", reportee.PartyUuid, reportee.PartyUuid, null, null, null, false),
                Times.Once);
            _instanceService.Verify(
                i => i.GetDelegatedInstances(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string>()),
                Times.Never);
        }

        private AuthorizedParty ArrangeReportee(int subunits)
        {
            var reportee = new AuthorizedParty
            {
                PartyUuid = Guid.NewGuid(),
                Name = "Hovedenhet AS",
                OrganizationNumber = MainOrgNumber,
                Type = AuthorizedPartyType.Organization,
                Subunits = new List<AuthorizedParty>(),
            };

            for (int i = 1; i <= subunits; i++)
            {
                reportee.Subunits.Add(new AuthorizedParty
                {
                    PartyUuid = Guid.NewGuid(),
                    Name = $"Underenhet {i}",
                    OrganizationNumber = (int.Parse(MainOrgNumber) + i).ToString(),
                    Type = AuthorizedPartyType.Organization,
                });
            }

            _userService.Setup(u => u.GetReporteeListForUser()).ReturnsAsync(new List<AuthorizedParty> { reportee });
            return reportee;
        }

        private static RolePermission DirectRolePermission(string code)
        {
            return new RolePermission
            {
                Role = new RoleMetadata { Id = Guid.NewGuid(), Code = code, Name = code },
                Permissions = new List<Permission>
                {
                    new Permission
                    {
                        To = new CompactEntity { Name = "Mottaker AS", Type = "Organisasjon", OrganizationIdentifier = "999999999" },
                    },
                },
            };
        }

        private static Dictionary<string, string> ReadZipEntries(byte[] zip)
        {
            var result = new Dictionary<string, string>();
            using var archive = new ZipArchive(new MemoryStream(zip), ZipArchiveMode.Read);
            foreach (ZipArchiveEntry entry in archive.Entries)
            {
                using var reader = new StreamReader(entry.Open());
                result[entry.FullName] = reader.ReadToEnd();
            }

            return result;
        }

        private static async Task WaitUntilAsync(Func<bool> condition, string description)
        {
            DateTime deadline = DateTime.UtcNow + WaitTimeout;
            while (!condition())
            {
                if (DateTime.UtcNow > deadline)
                {
                    throw new TimeoutException($"Timed out waiting for: {description}");
                }

                await Task.Delay(10);
            }
        }

        /// <summary>
        /// Hands out backend-call tasks that only complete when the test says so, and counts how many were started.
        /// </summary>
        private sealed class Gate<T>
        {
            private readonly ConcurrentQueue<TaskCompletionSource<T>> _pending = new();
            private int _started;

            public int Started => Volatile.Read(ref _started);

            public Task<T> Next()
            {
                Interlocked.Increment(ref _started);
                var source = new TaskCompletionSource<T>(TaskCreationOptions.RunContinuationsAsynchronously);
                _pending.Enqueue(source);
                return source.Task;
            }

            public bool ReleaseOne(T value)
            {
                if (_pending.TryDequeue(out TaskCompletionSource<T> source))
                {
                    source.SetResult(value);
                    return true;
                }

                return false;
            }

            public void FailAll(Exception exception)
            {
                while (_pending.TryDequeue(out TaskCompletionSource<T> source))
                {
                    source.SetException(exception);
                }
            }

            public async Task ReleaseUntilCompletedAsync(Task operation, T value)
            {
                DateTime deadline = DateTime.UtcNow + WaitTimeout;
                while (!operation.IsCompleted)
                {
                    if (DateTime.UtcNow > deadline)
                    {
                        throw new TimeoutException("Timed out releasing gated calls.");
                    }

                    if (!ReleaseOne(value))
                    {
                        await Task.Delay(10);
                    }
                }
            }
        }
    }
}
