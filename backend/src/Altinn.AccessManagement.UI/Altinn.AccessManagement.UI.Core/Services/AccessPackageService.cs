using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class AccessPackageService : IAccessPackageService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IAccessPackageClient _accessPackageClient;
        private readonly ILookupService _lookupService;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService"/> class.
        /// </summary>
        /// <param name="accessManagementClient">The access management client.</param>
        /// <param name="accessPackageClient">The access package client.</param>
        /// <param name="lookupService">The lookup service.</param>
        public AccessPackageService(IAccessManagementClient accessManagementClient, IAccessPackageClient accessPackageClient, ILookupService lookupService)
        {
            _accessManagementClient = accessManagementClient;
            _accessPackageClient = accessPackageClient;
            _lookupService = lookupService;
        }

        /// <inheritdoc />
        public async Task<List<AccessAreaFE>> GetSearch(string languageCode, string searchString)
        {
            IEnumerable<SearchObject<AccessPackage>> searchMatches = await _accessPackageClient.GetAccessPackageSearchMatches(languageCode, searchString);

            List<AccessAreaFE> sortedAreas = new List<AccessAreaFE>();

            foreach (SearchObject<AccessPackage> searchMatch in searchMatches)
            {
                int premadeAreaIndex = sortedAreas.FindIndex(area => area.Id == searchMatch.Object.Area.Id);

                if (premadeAreaIndex < 0)
                {
                    sortedAreas.Add(new AccessAreaFE(searchMatch.Object.Area, new List<AccessPackage> { searchMatch.Object }));
                }
                else
                {
                    sortedAreas[premadeAreaIndex].AccessPackages.Add(searchMatch.Object);
                }
            }

            return sortedAreas;
        }

        /// <inheritdoc/>
        public async Task<Dictionary<Guid, List<PackagePermission>>> GetDelegations(Guid party, Guid? to, Guid? from, string languageCode)
        {
            PaginatedResult<PackagePermission> paginatedAccesses = await _accessPackageClient.GetAccessPackageAccesses(party, to, from, null, languageCode);
            IEnumerable<PackagePermission> accesses = paginatedAccesses.Items;

            var sortedAccesses = new Dictionary<Guid, List<PackagePermission>>();

            foreach (PackagePermission access in accesses)
            {
                Guid areaId = access.Package.AreaId;

                if (!sortedAccesses.ContainsKey(areaId))
                {
                    sortedAccesses.Add(areaId, new List<PackagePermission> { access });
                }
                else
                {
                    sortedAccesses[areaId].Add(access);
                }
            }

            return sortedAccesses;
        }

        /// <inheritdoc />
        public async Task<AccessPackageFE> GetSinglePackagePermission(Guid party, Guid? to, Guid? from, Guid packageId, string languageCode)
        {
            PaginatedResult<PackagePermission> paginatedAccesses = await _accessPackageClient.GetAccessPackageAccesses(party, to, from, packageId, languageCode);
            var package = await GetAccessPackageById(languageCode, packageId);
            var packagePermissions = paginatedAccesses.Items.FirstOrDefault(x => x.Package.Id == packageId);
            if (package != null && packagePermissions != null)
            {
                return new AccessPackageFE
                {
                    Id = package.Id.ToString(),
                    Urn = package.Urn,
                    Name = package.Name,
                    IsAssignable = package.IsAssignable,
                    Description = package.Description,
                    Resources = ResourceUtils.MapToAccessPackageResourceFE(package.Resources),
                    Permissions = ConvertToPermissionFE(packagePermissions.Permissions)
                };
            }

            return null;
        }

        /// <summary>
        /// Converts a list of Permission objects to a list of PermissionFE objects, grouping by To.Id and collecting role codes.
        /// </summary>
        /// <param name="permissions">The list of Permission objects to convert.</param>
        /// <returns>A list of PermissionFE objects.</returns>
        public static List<PermissionFE> ConvertToPermissionFE(IEnumerable<Permission> permissions)
        {
            return permissions
                .GroupBy(p => p.To.Id)
                .Select(g => new PermissionFE
                {
                    From = g.First().From, // Take From from first permission in group
                    To = g.First().To,
                    RoleCodes = g.Select(p => p.Role?.Code).Where(code => !string.IsNullOrEmpty(code)).Distinct().ToList()
                })
                .ToList();
        }

        /// <inheritdoc />
        public async Task<AccessPackage> GetAccessPackageById(string languageCode, Guid packageId)
        {
            return await _accessPackageClient.GetAccessPackageById(languageCode, packageId);
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, Guid party, string packageId)
        {
            return _accessPackageClient.RevokeAccessPackage(from, to, party, packageId);
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> CreateDelegation(Guid party, Guid to, Guid from, string packageId)
        {
            return await _accessPackageClient.CreateAccessPackageDelegation(party, to, from, packageId);
        }

        /// <inheritdoc/>
        public async Task<List<AccessPackageDelegationCheckResponse>> DelegationCheck(DelegationCheckRequest delegationCheckRequest)
        {
            return await _accessManagementClient.AccessPackageDelegationCheck(delegationCheckRequest);
        }
    }
}
