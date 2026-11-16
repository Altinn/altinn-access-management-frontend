using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Helper class for mapping resource ids to <see cref="ServiceResourceFE"/>
    /// </summary>
    public class ResourceHelper
    {
        private readonly IResourceService _resourceService;

        private readonly IAccessPackageClient _accessPackageClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceHelper"/> class.
        /// </summary>
        /// <param name="resourceService">Resource service</param>
        /// <param name="accessPackageClient">Access package API client</param>
        public ResourceHelper(IResourceService resourceService, IAccessPackageClient accessPackageClient)
        {
            _resourceService = resourceService;
            _accessPackageClient = accessPackageClient;
        }

        /// <summary>
        /// Maps a list of resource ids to list of <see cref="ServiceResourceFE"/>. Resources that cannot be found are left out.
        /// </summary>
        /// <param name="resourceIds">List of resource ids to map</param>
        /// <param name="languageCode">Language code</param>
        public async Task<List<ServiceResourceFE>> EnrichResources(IEnumerable<string> resourceIds, string languageCode)
        {
            List<string> ids = resourceIds?.ToList() ?? [];
            Dictionary<string, ServiceResourceFE> resources = await _resourceService.GetResourcesFE(ids, languageCode);
            return ids.Where(resources.ContainsKey).Select(id => resources[id]).ToList();
        }

        /// <summary>
        /// Maps a list of access packages ids to list of <see cref="AccessPackageFE"/>
        /// </summary>
        /// <param name="accessPackageIds">List of access package ids to map</param>
        /// <param name="languageCode">Language code</param>
        public async Task<List<AccessPackageFE>> EnrichAccessPackages(IEnumerable<string> accessPackageIds, string languageCode)
        {
            if (!accessPackageIds.Any())
            {
                return [];
            }

            var accessPackageSearchMatches = await _accessPackageClient.GetAccessPackageSearchMatches(languageCode, string.Empty, null);
            List<AccessPackage> usedAccessPackages = accessPackageSearchMatches
                .Select(x => x.Object)
                .Where(package => accessPackageIds.Contains(package.Urn))
                .ToList();

            return await MapToAccessPackagesFE(usedAccessPackages, languageCode);
        }

        /// <summary>
        /// Maps access packages to <see cref="AccessPackageFE"/>, with the resources of all packages enriched in one pass
        /// </summary>
        /// <param name="accessPackages">The access packages to map</param>
        /// <param name="languageCode">Language code</param>
        public async Task<List<AccessPackageFE>> MapToAccessPackagesFE(IEnumerable<AccessPackage> accessPackages, string languageCode)
        {
            List<AccessPackage> packages = accessPackages?.Where(package => package != null).ToList() ?? [];
            Dictionary<string, ServiceResourceFE> resourcesByRefId = await _resourceService.GetResourcesFE(
                packages.SelectMany(package => package.Resources ?? []),
                languageCode);

            return packages.Select(package => AccessPackageFE.FromAccessPackage(package, resourcesByRefId)).ToList();
        }

        /// <summary>
        /// Maps a list of rights to lists of <see cref="ServiceResourceFE"/> and <see cref="AccessPackageFE"/>
        /// </summary>
        /// <param name="rights">List of rights</param>
        /// <param name="accessPackages">List of access packages</param>
        /// <param name="languageCode">Language code</param>
        public async Task<RegisteredSystemRightsFE> MapRightsToFrontendObjects(IEnumerable<Right> rights, IEnumerable<RegisteredSystemAccessPackage> accessPackages, string languageCode)
        {
            List<string> resourceIds = ResourceUtils.GetResourceIdsFromRights(rights);
            List<string> accessPackageIds = ResourceUtils.GetAccessPackageIdsFromRights(accessPackages);

            return new()
            {
                Resources = await EnrichResources(resourceIds, languageCode),
                AccessPackages = await EnrichAccessPackages(accessPackageIds, languageCode),
            };
        }
    }
}
