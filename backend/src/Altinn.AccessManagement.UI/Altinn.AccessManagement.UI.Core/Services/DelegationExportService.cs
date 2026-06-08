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
using Microsoft.Extensions.Logging;

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

        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly IAccessPackageService _accessPackageService;
        private readonly ISingleRightService _singleRightService;
        private readonly IInstanceService _instanceService;
        private readonly ILogger<DelegationExportService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationExportService"/> class.
        /// </summary>
        public DelegationExportService(
            IUserService userService,
            IRoleService roleService,
            IAccessPackageService accessPackageService,
            ISingleRightService singleRightService,
            IInstanceService instanceService,
            ILogger<DelegationExportService> logger)
        {
            _userService = userService;
            _roleService = roleService;
            _accessPackageService = accessPackageService;
            _singleRightService = singleRightService;
            _instanceService = instanceService;
            _logger = logger;
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

            var files = new Dictionary<string, byte[]>();

            if (IncludeType(TypeRoles))
            {
                try
                {
                    string filename = language == "en" ? "roles.csv" : "roller.csv";
                    List<RoleExportRow> rows = await BuildRoleRows(givers, language);
                    files[filename] = DelegationExportCsvBuilder.WriteCsv(rows, new RoleExportRowMap(language));
                }
                catch (HttpStatusException ex)
                {
                    throw new HttpStatusException(ex.Type, "Role", ex.StatusCode, ex.TraceId, ex.Message);
                }
            }

            if (IncludeType(TypeAccessPackages))
            {
                try
                {
                    List<AccessPackageExportRow> rows = await BuildAccessPackageRows(givers, language);
                    string filename = language == "en" ? "access_packages.csv" : language == "nn" ? "tilgangspakkar.csv" : "tilgangspakker.csv";
                    files[filename] = DelegationExportCsvBuilder.WriteCsv(rows, new AccessPackageExportRowMap(language));
                }
                catch (HttpStatusException ex)
                {
                    throw new HttpStatusException(ex.Type, "AccessPackage", ex.StatusCode, ex.TraceId, ex.Message);
                }
            }

            if (IncludeType(TypeSingleRights))
            {
                try
                {
                    List<SingleRightExportRow> rows = await BuildSingleRightRows(givers, language);
                    string filename = language == "en" ? "single_rights.csv" : language == "nn" ? "enkelttenester.csv" : "enkelttjenester.csv";
                    files[filename] = DelegationExportCsvBuilder.WriteCsv(rows, new SingleRightExportRowMap(language));
                }
                catch (HttpStatusException ex)
                {
                    throw new HttpStatusException(ex.Type, "SingleRights", ex.StatusCode, ex.TraceId, ex.Message);
                }
            }

            if (IncludeType(TypeInstances))
            {
                try
                {
                    List<InstanceRightExportRow> rows = await BuildInstanceRows(givers, language);
                    string filename = language == "en" ? "instance_rights.csv" : language == "nn" ? "enkelttenester-instans.csv" : "enkelttjenester-instans.csv";
                    files[filename] = DelegationExportCsvBuilder.WriteCsv(rows, new InstanceRightExportRowMap(language));
                }
                catch (HttpStatusException ex)
                {
                    throw new HttpStatusException(ex.Type, "Instances", ex.StatusCode, ex.TraceId, ex.Message);
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

        private async Task<List<RoleExportRow>> BuildRoleRows(List<AuthorizedParty> givers, string language)
        {
            var rows = new List<RoleExportRow>();
            Dictionary<Guid, string> roleNameLookup = await BuildRoleNameLookup(language);

            foreach (AuthorizedParty giver in givers)
            {
                List<RolePermission> permissions = await _roleService.GetRolePermissions(giver.PartyUuid, giver.PartyUuid, null, language);
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

        private async Task<List<AccessPackageExportRow>> BuildAccessPackageRows(List<AuthorizedParty> givers, string language)
        {
            var rows = new List<AccessPackageExportRow>();
            Dictionary<Guid, string> packageNames = await BuildPackageNameLookup(language);

            foreach (AuthorizedParty giver in givers)
            {
                Dictionary<Guid, List<PackagePermission>> delegations =
                    await _accessPackageService.GetDelegations(giver.PartyUuid, null, giver.PartyUuid, language);

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
            }

            return rows;
        }

        private async Task<List<InstanceRightExportRow>> BuildInstanceRows(List<AuthorizedParty> givers, string language)
        {
            var rows = new List<InstanceRightExportRow>();

            foreach (AuthorizedParty giver in givers)
            {
                List<InstanceDelegation> delegations =
                    await _instanceService.GetDelegatedInstances(language, giver.PartyUuid, giver.PartyUuid, null, null, null);

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
            }

            return rows;
        }

        // Single-rights RESOURCE delegations (without actions/operations) are listed for all
        // recipients at once; the recipient is read from each permission's "to" party. Since the
        // export does not include operations, no per-recipient ".../rights" lookup is needed.
        private async Task<List<SingleRightExportRow>> BuildSingleRightRows(List<AuthorizedParty> givers, string language)
        {
            var rows = new List<SingleRightExportRow>();

            foreach (AuthorizedParty giver in givers)
            {
                List<ResourceDelegation> delegations =
                    await _singleRightService.GetDelegatedResources(language, giver.PartyUuid, giver.PartyUuid, null);

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
