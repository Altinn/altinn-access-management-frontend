using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Helper class for mapping resource ids to <see cref="ServiceResourceFE"/>
    /// </summary>
    public class ResourceHelper
    {
        private readonly IResourceRegistryClient _resourceRegistryClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceHelper"/> class.
        /// </summary>
        /// <param name="resourceRegistryClient">Resource registry client</param>
        public ResourceHelper(IResourceRegistryClient resourceRegistryClient)
        {
            _resourceRegistryClient = resourceRegistryClient;
        }

        /// <summary>
        /// Maps a list of resource ids to list of <see cref="ServiceResourceFE"/>
        /// </summary>
        /// <param name="resourceIds">List of resource ids to map</param>
        /// <param name="languageCode">Language code</param>
        public async Task<List<ServiceResourceFE>> EnrichResources(List<string> resourceIds, string languageCode)
        {
            // GET resources
            IEnumerable<Task<ServiceResource>> resourceTasks = resourceIds.Select(resourceId => _resourceRegistryClient.GetResource(resourceId));
            IEnumerable<ServiceResource> resources = await Task.WhenAll(resourceTasks);
            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();
            List<ServiceResourceFE> resourcesFE = ResourceUtils.MapToServiceResourcesFE(languageCode, resources, orgList);
            return resourcesFE;
        }
    }
}