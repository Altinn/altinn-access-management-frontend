using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
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
        private readonly IResourceRegistryClient _resourceRegistryClient;

        private readonly IAccessPackageClient _accessPackageClient;

        private readonly IAltinnCdnService _altinnCdnService;

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceHelper"/> class.
        /// </summary>
        /// <param name="resourceRegistryClient">Resource registry client</param>
        /// <param name="accessPackageClient">Access package API client</param>
        /// <param name="altinnCdnService">Altinn CDN service</param>
        public ResourceHelper(IResourceRegistryClient resourceRegistryClient, IAccessPackageClient accessPackageClient, IAltinnCdnService altinnCdnService)
        {
            _resourceRegistryClient = resourceRegistryClient;
            _accessPackageClient = accessPackageClient;
            _altinnCdnService = altinnCdnService;
        }

        /// <summary>
        /// Maps a list of resource ids to list of <see cref="ServiceResourceFE"/>
        /// </summary>
        /// <param name="resourceIds">List of resource ids to map</param>
        /// <param name="languageCode">Language code</param>
        public async Task<List<ServiceResourceFE>> EnrichResources(IEnumerable<string> resourceIds, string languageCode)
        {
            List<ServiceResourceFE> resourcesFE = [];

            if (resourceIds.Any())
            {
                // GET resources
                List<ServiceResource> resources = [];

                // Load resources one at a time to avoid starting all requests in parallel
                foreach (var resourceId in resourceIds)
                {
                    try
                    {
                        var resource = await _resourceRegistryClient.GetResource(resourceId);
                        if (resource != null)
                        {
                            resources.Add(resource);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Let cancellation-related exceptions propagate so callers can observe cancellation
                        if (ex is TaskCanceledException || ex is OperationCanceledException)
                        {
                            throw;
                        }

                        // Log failures here to avoid silently swallowing exceptions and to include the resource id
                        Console.Error.WriteLine($"Failed to load resource '{resourceId}': {ex}");
                    }
                }

                Dictionary<string, Models.Common.OrgData> orgList = await _altinnCdnService.GetOrgData();
                resourcesFE = ResourceUtils.MapToServiceResourcesFE(languageCode, resources, orgList);
            }

            return resourcesFE;
        }

        /// <summary>
        /// Maps a list of access packages ids to list of <see cref="AccessPackageFE"/>
        /// </summary>
        /// <param name="accessPackageIds">List of access package ids to map</param>
        /// <param name="languageCode">Language code</param>
        public async Task<List<AccessPackageFE>> EnrichAccessPackages(IEnumerable<string> accessPackageIds, string languageCode)
        {
            List<AccessPackageFE> accessPackagesFE = [];

            if (accessPackageIds.Any())
            {
                var accessPackageSearchMatches = await _accessPackageClient.GetAccessPackageSearchMatches(languageCode, string.Empty, null);
                IEnumerable<AccessPackage> accessPackages = accessPackageSearchMatches.Select(x => x.Object);

                IEnumerable<AccessPackage> usedAccessPackages = accessPackages.Where(package => accessPackageIds.Contains(package.Urn));

                foreach (AccessPackage accessPackage in usedAccessPackages)
                {
                    accessPackagesFE.Add(new AccessPackageFE()
                    {
                        Id = accessPackage.Id.ToString(),
                        Urn = accessPackage.Urn,
                        Description = accessPackage.Description,
                        Name = accessPackage.Name,
                        IsAssignable = accessPackage.IsAssignable,
                        IsDelegable = accessPackage.IsDelegable,
                        Resources = ResourceUtils.MapToAccessPackageResourceFE(accessPackage.Resources)
                    });
                }
            }

            return accessPackagesFE;
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