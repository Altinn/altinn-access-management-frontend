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

        // Max giver calls in flight per right type; the four types run concurrently, so 4 x this in total
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

            // Build each right type as its own job so the fan-outs overlap; the first failure cancels the rest
            using var abort = new CancellationTokenSource();
            var jobs = new List<(string EntryName, Task<Action<Stream>> Writer)>();

            if (IncludeType(TypeRoles))
            {
                string filename = language == "en" ? "roles.csv" : "roller.csv";
                jobs.Add((filename, RunTagged("Role", abort, async cancellationToken =>
                {
                    List<RoleExportRow> rows = await BuildRoleRows(givers, language, cancellationToken);
                    return stream => DelegationExportCsvBuilder.WriteCsv(rows, new RoleExportRowMap(language), stream);
                })));
            }

            if (IncludeType(TypeAccessPackages))
            {
                string filename = language == "en" ? "access_packages.csv" : language == "nn" ? "tilgangspakkar.csv" : "tilgangspakker.csv";
                jobs.Add((filename, RunTagged("AccessPackage", abort, async cancellationToken =>
                {
                    List<AccessPackageExportRow> rows = await BuildAccessPackageRows(givers, language, cancellationToken);
                    return stream => DelegationExportCsvBuilder.WriteCsv(rows, new AccessPackageExportRowMap(language), stream);
                })));
            }

            if (IncludeType(TypeSingleRights))
            {
                string filename = language == "en" ? "single_rights.csv" : language == "nn" ? "enkelttenester.csv" : "enkelttjenester.csv";
                jobs.Add((filename, RunTagged("SingleRights", abort, async cancellationToken =>
                {
                    List<SingleRightExportRow> rows = await BuildSingleRightRows(givers, language, cancellationToken);
                    return stream => DelegationExportCsvBuilder.WriteCsv(rows, new SingleRightExportRowMap(language), stream);
                })));
            }

            if (IncludeType(TypeInstances))
            {
                string filename = language == "en" ? "instance_rights.csv" : language == "nn" ? "enkelttenester-instans.csv" : "enkelttjenester-instans.csv";
                jobs.Add((filename, RunTagged("Instances", abort, async cancellationToken =>
                {
                    List<InstanceRightExportRow> rows = await BuildInstanceRows(givers, language, cancellationToken);
                    return stream => DelegationExportCsvBuilder.WriteCsv(rows, new InstanceRightExportRowMap(language), stream);
                })));
            }

            // Await every job so nothing outlives the request; rethrows the first failure in job order
            await Task.WhenAll(jobs.Select(job => job.Writer));

            var entries = new List<(string EntryName, Action<Stream> Write)>();
            foreach ((string entryName, Task<Action<Stream>> writer) in jobs)
            {
                Action<Stream> write = await writer;
                if (write != null)
                {
                    entries.Add((entryName, write));
                }
            }

            byte[] zip = DelegationExportCsvBuilder.BuildZip(entries);
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
            // Run the role-name lookup and the giver fan-out concurrently; each giver is mapped to rows as its response arrives
            Task<Dictionary<Guid, string>> lookupTask = BuildRoleNameLookup(language);
            Task<List<RoleExportRow>[]> rowsTask = ForEachGiverAsync(
                givers,
                async giver =>
                {
                    List<RolePermission> permissions = await _roleService.GetRolePermissions(giver.PartyUuid, giver.PartyUuid, null, language);
                    return MapRoleRows(giver, permissions, await lookupTask);
                },
                cancellationToken);

            await Task.WhenAll(lookupTask, rowsTask);
            return (await rowsTask).SelectMany(rows => rows).ToList();
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
            // Run the package-name lookup and the giver fan-out concurrently; each giver is mapped to rows as its response arrives
            Task<Dictionary<Guid, string>> lookupTask = BuildPackageNameLookup(language);
            Task<List<AccessPackageExportRow>[]> rowsTask = ForEachGiverAsync(
                givers,
                async giver =>
                {
                    Dictionary<Guid, List<PackagePermission>> delegations = await _accessPackageService.GetDelegations(giver.PartyUuid, null, giver.PartyUuid, language);
                    return MapAccessPackageRows(giver, delegations, await lookupTask);
                },
                cancellationToken);

            await Task.WhenAll(lookupTask, rowsTask);
            return (await rowsTask).SelectMany(rows => rows).ToList();
        }

        private async Task<List<InstanceRightExportRow>> BuildInstanceRows(List<AuthorizedParty> givers, string language, CancellationToken cancellationToken)
        {
            // Skip Dialogporten enrichment; the export only needs resource and instance ids
            List<InstanceRightExportRow>[] rowsPerGiver = await ForEachGiverAsync(
                givers,
                async giver => MapInstanceRows(giver, await _instanceService.GetDelegatedInstances(language, giver.PartyUuid, giver.PartyUuid, null, null, null, includeDialogLookup: false)),
                cancellationToken);

            return rowsPerGiver.SelectMany(rows => rows).ToList();
        }

        // Single-rights RESOURCE delegations (without actions/operations) are listed for all
        // recipients at once; the recipient is read from each permission's "to" party. Since the
        // export does not include operations, no per-recipient ".../rights" lookup is needed.
        private async Task<List<SingleRightExportRow>> BuildSingleRightRows(List<AuthorizedParty> givers, string language, CancellationToken cancellationToken)
        {
            List<SingleRightExportRow>[] rowsPerGiver = await ForEachGiverAsync(
                givers,
                async giver => MapSingleRightRows(giver, await _singleRightService.GetDelegatedResources(language, giver.PartyUuid, giver.PartyUuid, null)),
                cancellationToken);

            return rowsPerGiver.SelectMany(rows => rows).ToList();
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

        // Tags backend errors with the right type (reported by the controller) and cancels sibling builders.
        // A builder cancelled because a sibling failed returns null; the sibling's exception is surfaced.
        private static async Task<Action<Stream>> RunTagged(string origin, CancellationTokenSource abort, Func<CancellationToken, Task<Action<Stream>>> build)
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

        // One call per giver, max MaxConcurrentRequestsPerType in flight, results kept in giver order; the callback
        // maps the response to rows right away so the backend DTOs can be collected early
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

        private static List<RoleExportRow> MapRoleRows(AuthorizedParty giver, List<RolePermission> permissions, Dictionary<Guid, string> roleNameLookup)
        {
            var rows = new List<RoleExportRow>();
            foreach (RolePermission rolePermission in permissions ?? new List<RolePermission>())
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

            return rows;
        }

        private static List<AccessPackageExportRow> MapAccessPackageRows(AuthorizedParty giver, Dictionary<Guid, List<PackagePermission>> delegations, Dictionary<Guid, string> packageNames)
        {
            var rows = new List<AccessPackageExportRow>();
            foreach (List<PackagePermission> packagePermissions in (delegations ?? new Dictionary<Guid, List<PackagePermission>>()).Values)
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

            return rows;
        }

        private static List<InstanceRightExportRow> MapInstanceRows(AuthorizedParty giver, List<InstanceDelegation> delegations)
        {
            var rows = new List<InstanceRightExportRow>();
            foreach (InstanceDelegation delegation in delegations ?? new List<InstanceDelegation>())
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

            return rows;
        }

        private static List<SingleRightExportRow> MapSingleRightRows(AuthorizedParty giver, List<ResourceDelegation> delegations)
        {
            var rows = new List<SingleRightExportRow>();
            foreach (ResourceDelegation delegation in delegations ?? new List<ResourceDelegation>())
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

            return rows;
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
