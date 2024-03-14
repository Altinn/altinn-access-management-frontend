using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IResourceRegistryClient"></see> interface
    /// </summary>
    public class ResourceRegistryClientMock : IResourceRegistryClient
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceRegistryClient" /> class
        /// </summary>
        public ResourceRegistryClientMock()
        {
        }

        /// <inheritdoc />
        public async Task<ServiceResource> GetResource(string resourceId)
        {
            string resourcesPath = GetResourcePath(resourceId);
            ServiceResource resource = Util.GetMockData<ServiceResource>(resourcesPath);

            return await Task.FromResult(resource);
        }

        /// <inheritdoc />
        public Task<List<ServiceResource>> GetResources()
        {
            string path = GetDataPathForResources();

            List<ServiceResource> resources = Util.GetMockData<List<ServiceResource>>(path);

            return Task.FromResult(resources);
        }
        
        /// <inheritdoc />
        public Task<List<ServiceResource>> GetMaskinportenSchemas()
        {

            string path = GetDataPathForResources();

            List<ServiceResource> resources = Util.GetMockData<List<ServiceResource>>(path);
            
            List<ServiceResource> maskinPortenSchemas = resources.FindAll(r => r.ResourceType == ResourceType.MaskinportenSchema);
            return Task.FromResult(maskinPortenSchemas);
        }

        /// <inheritdoc />
        public Task<List<ServiceResource>> GetResourceList()
        {
            return GetResources();
        }

        /// <inheritdoc />
        public Task<OrgList> GetAllResourceOwners()
        {
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            string path = Path.Combine(unitTestFolder, "Data", "ResourceRegistry", "resourceowners.json");

            OrgList orgList = Util.GetMockData<OrgList>(path);

            return Task.FromResult(orgList);
        }

        private static string GetResourcePath(string resourceRegistryId)
        {
            string mockClientFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(mockClientFolder, "Data", "ResourceRegistry", $"{resourceRegistryId}", "resource.json");
        }

        private static string GetDataPathForResources()
        {
            string? mockClientFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(mockClientFolder, "Data", "ResourceRegistry", "resources.json");
        }
    }
}
