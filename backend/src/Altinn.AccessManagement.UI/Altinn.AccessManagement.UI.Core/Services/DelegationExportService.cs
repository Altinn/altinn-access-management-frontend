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
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class DelegationExportService : IDelegationExportService
    {
        private const string TypeRoles = "roles";
        private const string TypeAccessPackages = "accesspackages";
        private const string TypeSingleRights = "singlerights";
        private const string TypeInstances = "instances";
        private const string DefaultLanguage = "nb";

        // Upper bound on giver-level backend calls in flight per right type. The four types run
        // concurrently, so a single export issues at most 4 x this many backend requests at once.
        private const int MaxConcurrentRequestsPerType = 8;

        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly IAccessPackageService _accessPackageService;
        private readonly ISingleRightService _singleRightService;
        private readonly IInstanceService _instanceService;
        
        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationExportService"/> class.
        /// </summary>
        public DelegationExportService(
            IUserService userService,
            IRoleService roleService,
            IAccessPackageService accessPackageService,
            ISingleRightService singleRightService,
            IInstanceService instanceService)
        {
            _userService = userService;
            _roleService = roleService;
            _accessPackageService = accessPackageService;
            _singleRightService = singleRightService;
            _instanceService = instanceService;
        }

        /// <inheritdoc />
        public async Task<DelegationExportResult> ExportReporteeDelegations(Guid partyUuid, bool includeSubunits, ISet<string> types, string languageCode)
        {
            string language = string.IsNullOrWhiteSpace(languageCode) ? DefaultLanguage : languageCode;
            bool IncludeType(string type) => types == null || types.Count == 0 || types.Contains(type);

            AuthorizedParty reportee = await ResolveReportee(partyUuid);
            if (reportee == null)
            {
                return DelegationExportResult.Fail(DelegationExportStatus.PartyNotFound);
            }

            if (reportee.Type != AuthorizedPartyType.Organization)
            {
                return DelegationExportResult.Fail(DelegationExportStatus.NotOrganization);
            }

            List<AuthorizedParty> givers = new List<AuthorizedParty> { reportee };
            if (includeSubunits && reportee.Subunits != null)
            {
                givers.AddRange(reportee.Subunits);
            }

            // Each right type is built as its own job so that the four backend fan-outs overlap.
            // The shared cancellation source lets the first failing type stop the others from
            // starting new backend calls; everything is still awaited before this method returns.
            using var abort = new CancellationTokenSource();
            var jobs = new List<(string EntryName, Task<byte[]> Content)>();

            if (IncludeType(TypeRoles))
            {
                string filename = language == "en" ? "roles.csv" : "roller.csv";
                jobs.Add((filename, RunTagged("Role", abort, async cancellationToken =>
                {
                    List<RoleExportRow> rows = await BuildRoleRows(givers, language, cancellationToken);
                    return DelegationExportCsvBuilder.WriteCsv(rows, new RoleExportRowMap(language));
                })));
            }

            if (IncludeType(TypeAccessPackages))
            {
                string filename = language == "en" ? "access_packages.csv" : language == "nn" ? "tilgangspakkar.csv" : "tilgangspakker.csv";
                jobs.Add((filename, RunTagged("AccessPackage", abort, async cancellationToken =>
                {
                    List<AccessPackageExportRow> rows = await BuildAccessPackageRows(givers, language, cancellationToken);
                    return DelegationExportCsvBuilder.WriteCsv(rows, new AccessPackageExportRowMap(language));
                })));
            }

            if (IncludeType(TypeSingleRights))
            {
                string filename = language == "en" ? "single_rights.csv" : language == "nn" ? "enkelttenester.csv" : "enkelttjenester.csv";
                jobs.Add((filename, RunTagged("SingleRights", abort, async cancellationToken =>
                {
                    List<SingleRightExportRow> rows = await BuildSingleRightRows(givers, language, cancellationToken);
                    return DelegationExportCsvBuilder.WriteCsv(rows, new SingleRightExportRowMap(language));
                })));
            }

            if (IncludeType(TypeInstances))
            {
                string filename = language == "en" ? "instance_rights.csv" : language == "nn" ? "enkelttenester-instans.csv" : "enkelttjenester-instans.csv";
                jobs.Add((filename, RunTagged("Instances", abort, async cancellationToken =>
                {
                    List<InstanceRightExportRow> rows = await BuildInstanceRows(givers, language, cancellationToken);
                    return DelegationExportCsvBuilder.WriteCsv(rows, new InstanceRightExportRowMap(language));
                })));
            }

            // Observes every job (also after a failure), so no builder outlives the request. If a job
            // failed, this rethrows the first failure in job order.
            await Task.WhenAll(jobs.Select(job => job.Content));

            var files = new Dictionary<string, byte[]>();
            foreach ((string entryName, Task<byte[]> content) in jobs)
            {
                byte[] csv = await content;
                if (csv != null)
                {
                    files[entryName] = csv;
                }
            }

            byte[] zip = DelegationExportCsvBuilder.BuildZip(files);
            string fileName = $"{reportee.OrganizationNumber}_{DateTime.UtcNow:yyyy-MM-dd}.zip";
            return DelegationExportResult.Success(zip, fileName);
        }

        private async Task<AuthorizedParty> ResolveReportee(Guid partyUuid)
        {
            List<AuthorizedParty> reporteeList = await _userService.GetReporteeListForUser();
            foreach (AuthorizedParty party in reporteeList ?? new List<AuthorizedParty>())
            {
                if (party.PartyUuid == partyUuid)
                {
                    return party;
                }

                if (party.Subunits != null)
                {
                    foreach (AuthorizedParty subunit in party.Subunits)
                    {
                        if (subunit.PartyUuid == partyUuid)
                        {
                            return subunit;
                        }
                    }
                }
            }

            return null;
        }

        private async Task<List<RoleExportRow>> BuildRoleRows(List<AuthorizedParty> givers, string language, CancellationToken cancellationToken)
        {
            // The role-name lookup and the per-giver fan-out are independent, so they run concurrently.
            Task<Dictionary<Guid, string>> lookupTask = BuildRoleNameLookup(language);
            Task<List<RolePermission>[]> permissionsTask = ForEachGiverAsync(
                givers,
                giver => _roleService.GetRolePermissions(giver.PartyUuid, giver.PartyUuid, null, language),
                cancellationToken);

            await Task.WhenAll(lookupTask, permissionsTask);
            Dictionary<Guid, string> roleNameLookup = await lookupTask;
            List<RolePermission>[] permissionsPerGiver = await permissionsTask;

            var rows = new List<RoleExportRow>();
            for (int i = 0; i < givers.Count; i++)
            {
                AuthorizedParty giver = givers[i];
                foreach (RolePermission rolePermission in permissionsPerGiver[i] ?? new List<RolePermission>())
                {
                    foreach (Permission permission in DirectPermissions(rolePermission.Permissions))
                    {
                        string roleName = rolePermission.Role != null && roleNameLookup.TryGetValue(rolePermission.Role.Id, out string name)
                            ? name
                            : rolePermission.Role?.Name;

                        rows.Add(new RoleExportRow
                        {
                            GiverOrgnr = giver.OrganizationNumber,
                            GiverNavn = giver.Name,
                            MottakerId = RecipientId(permission.To),
                            MottakerNavn = permission.To?.Name,
                            MottakerType = permission.To?.Type,
                            RolleNavn = roleName,
                            RolleCode = rolePermission.Role?.Code,
                        });
                    }
                }
            }

            return rows;
        }

        private async Task<Dictionary<Guid, string>> BuildRoleNameLookup(string language)
        {
            var map = new Dictionary<Guid, string>();
            var allRoles = await _roleService.GetAllRoles(language);
            foreach (var role in allRoles ?? Enumerable.Empty<Altinn.AccessManagement.UI.Core.Models.Common.Role>())
            {
                map[role.Id] = role.Name;
            }

            return map;
        }

        private async Task<List<AccessPackageExportRow>> BuildAccessPackageRows(List<AuthorizedParty> givers, string language, CancellationToken cancellationToken)
        {
            // The package-name lookup and the per-giver fan-out are independent, so they run concurrently.
            Task<Dictionary<Guid, string>> lookupTask = BuildPackageNameLookup(language);
            Task<Dictionary<Guid, List<PackagePermission>>[]> delegationsTask = ForEachGiverAsync(
                givers,
                giver => _accessPackageService.GetDelegations(giver.PartyUuid, null, giver.PartyUuid, language),
                cancellationToken);

            await Task.WhenAll(lookupTask, delegationsTask);
            Dictionary<Guid, string> packageNames = await lookupTask;
            Dictionary<Guid, List<PackagePermission>>[] delegationsPerGiver = await delegationsTask;

            var rows = new List<AccessPackageExportRow>();
            for (int i = 0; i < givers.Count; i++)
            {
                AuthorizedParty giver = givers[i];
                foreach (List<PackagePermission> packagePermissions in (delegationsPerGiver[i] ?? new Dictionary<Guid, List<PackagePermission>>()).Values)
                {
                    foreach (PackagePermission packagePermission in packagePermissions)
                    {
                        string packageName = packagePermission.Package != null && packageNames.TryGetValue(packagePermission.Package.Id, out string name)
                            ? name
                            : null;

                        foreach (Permission permission in DirectPermissions(packagePermission.Permissions))
                        {
                            rows.Add(new AccessPackageExportRow
                            {
                                GiverOrgnr = giver.OrganizationNumber,
                                GiverNavn = giver.Name,
                                MottakerId = RecipientId(permission.To),
                                MottakerNavn = permission.To?.Name,
                                MottakerType = permission.To?.Type,
                                TilgangspakkeNavn = packageName,
                                TilgangspakkeCode = packagePermission.Package?.Urn,
                            });
                        }
                    }
                }
            }

            return rows;
        }

        private async Task<List<InstanceRightExportRow>> BuildInstanceRows(List<AuthorizedParty> givers, string language, CancellationToken cancellationToken)
        {
            // Dialogporten enrichment is skipped: the export only needs resource and instance identifiers.
            List<InstanceDelegation>[] delegationsPerGiver = await ForEachGiverAsync(
                givers,
                giver => _instanceService.GetDelegatedInstances(language, giver.PartyUuid, giver.PartyUuid, null, null, null, includeDialogLookup: false),
                cancellationToken);

            var rows = new List<InstanceRightExportRow>();
            for (int i = 0; i < givers.Count; i++)
            {
                AuthorizedParty giver = givers[i];
                foreach (InstanceDelegation delegation in delegationsPerGiver[i] ?? new List<InstanceDelegation>())
                {
                    foreach (Permission permission in DirectPermissions(delegation.Permissions))
                    {
                        rows.Add(new InstanceRightExportRow
                        {
                            GiverOrgnr = giver.OrganizationNumber,
                            GiverNavn = giver.Name,
                            MottakerId = RecipientId(permission.To),
                            MottakerNavn = permission.To?.Name,
                            MottakerType = permission.To?.Type,
                            TjenesteNavn = delegation.Resource?.Title,
                            ResourceId = delegation.Resource?.Identifier,
                            InstansId = delegation.Instance?.RefId,
                        });
                    }
                }
            }

            return rows;
        }

        // Single-rights RESOURCE delegations (without actions/operations) are listed for all
        // recipients at once; the recipient is read from each permission's "to" party. Since the
        // export does not include operations, no per-recipient ".../rights" lookup is needed.
        private async Task<List<SingleRightExportRow>> BuildSingleRightRows(List<AuthorizedParty> givers, string language, CancellationToken cancellationToken)
        {
            List<ResourceDelegation>[] delegationsPerGiver = await ForEachGiverAsync(
                givers,
                giver => _singleRightService.GetDelegatedResources(language, giver.PartyUuid, giver.PartyUuid, null),
                cancellationToken);

            var rows = new List<SingleRightExportRow>();
            for (int i = 0; i < givers.Count; i++)
            {
                AuthorizedParty giver = givers[i];
                foreach (ResourceDelegation delegation in delegationsPerGiver[i] ?? new List<ResourceDelegation>())
                {
                    foreach (Permission permission in DirectPermissions(delegation.Permissions))
                    {
                        rows.Add(new SingleRightExportRow
                        {
                            GiverOrgnr = giver.OrganizationNumber,
                            GiverNavn = giver.Name,
                            MottakerId = RecipientId(permission.To),
                            MottakerNavn = permission.To?.Name,
                            MottakerType = permission.To?.Type,
                            TjenesteNavn = delegation.Resource?.Title,
                            ResourceId = delegation.Resource?.Identifier,
                        });
                    }
                }
            }

            return rows;
        }

        private async Task<Dictionary<Guid, string>> BuildPackageNameLookup(string language)
        {
            var map = new Dictionary<Guid, string>();
            List<AccessAreaFE> areas = await _accessPackageService.GetSearch(language, string.Empty, null);
            foreach (AccessAreaFE area in areas ?? new List<AccessAreaFE>())
            {
                foreach (AccessPackage package in area.AccessPackages ?? new List<AccessPackage>())
                {
                    map[package.Id] = package.Name;
                }
            }

            return map;
        }

        // Runs one right-type builder. Backend HttpStatusExceptions are re-thrown tagged with the type
        // they came from (the controller reports this origin), and the first failure of any kind cancels
        // the shared token so sibling builders stop starting new backend calls. A builder that was
        // cancelled because a sibling failed returns null; the sibling's exception is the one surfaced.
        private static async Task<byte[]> RunTagged(string origin, CancellationTokenSource abort, Func<CancellationToken, Task<byte[]>> build)
        {
            try
            {
                return await build(abort.Token);
            }
            catch (HttpStatusException ex)
            {
                abort.Cancel();
                throw new HttpStatusException(ex.Type, origin, ex.StatusCode, ex.TraceId, ex.Message);
            }
            catch (OperationCanceledException) when (abort.IsCancellationRequested)
            {
                return null;
            }
            catch
            {
                abort.Cancel();
                throw;
            }
        }

        // Issues one backend call per giver with at most MaxConcurrentRequestsPerType in flight.
        // Results are stored by giver index so callers can map them back in the original giver order,
        // which keeps the CSV row order deterministic. Parallel.ForEachAsync stops starting new
        // iterations after the first failure or cancellation and always waits for the ones in flight.
        private static async Task<TResult[]> ForEachGiverAsync<TResult>(List<AuthorizedParty> givers, Func<AuthorizedParty, Task<TResult>> fetch, CancellationToken cancellationToken)
        {
            var results = new TResult[givers.Count];
            var options = new ParallelOptions
            {
                MaxDegreeOfParallelism = MaxConcurrentRequestsPerType,
                CancellationToken = cancellationToken,
            };

            await Parallel.ForEachAsync(Enumerable.Range(0, givers.Count), options, async (index, _) =>
            {
                results[index] = await fetch(givers[index]);
            });

            return results;
        }

        // Only direct delegations are included (v1 scope): permissions routed via an
        // intermediary party (inherited/indirect) are skipped.
        private static IEnumerable<Permission> DirectPermissions(IEnumerable<Permission> permissions)
        {
            return (permissions ?? Enumerable.Empty<Permission>()).Where(p => p != null && p.Via == null);
        }

        private static string RecipientId(CompactEntity recipient)
        {
            if (recipient == null)
            {
                return string.Empty;
            }

            if (!string.IsNullOrEmpty(recipient.OrganizationIdentifier))
            {
                return recipient.OrganizationIdentifier;
            }

            return PersonIdentifierUtils.FormatDateOfBirth(recipient.DateOfBirth);
        }
    }
}
