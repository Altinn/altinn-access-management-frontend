using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IResourceClient"></see> interface
    /// </summary>
    public class ResourceClientMock : IResourceClient
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceRegistryClient" /> class
        /// </summary>
        public ResourceClientMock()
        {
        }

        /// <inheritdoc />
        public async Task<ServiceResource> GetResource(string resourceId)
        {
            ServiceResource resource = null;
            string resourcesPath = GetResourcePath(resourceId);
            if (File.Exists(resourcesPath))
            {
                string content = File.ReadAllText(resourcesPath);
                resource = (ServiceResource)JsonSerializer.Deserialize(content, typeof(ServiceResource), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            return await Task.FromResult(resource);
        }

        /// <inheritdoc />
        public Task<List<ServiceResource>> GetResources()
        {
            List<ServiceResource> resources = new List<ServiceResource>();

            string path = GetDataPathForResources();

            if (File.Exists(path))
            {

                JsonSerializerOptions options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };

                string content = File.ReadAllText(path);
                resources = JsonSerializer.Deserialize<List<ServiceResource>>(content, options);

            }
            return Task.FromResult(resources);
        }

        /// <inheritdoc />
        public Task<OrgList> GetAllResourceOwners()
        {
            return Task.FromResult(ResourceUtil.GetMockedResourceRegistryOrgList());
        }

        /// <inheritdoc />
        public Task<List<ServiceResource>> GetResourceList()
        {
            return GetResources();
        }

        private static string GetResourcePath(string resourceRegistryId)
        {
            string mockClientFolder = Path.GetDirectoryName(new Uri(typeof(ResourceClientMock).Assembly.Location).LocalPath);
            return Path.Combine(mockClientFolder, "Data", "ResourceRegistry", $"{resourceRegistryId}", "resource.json");
        }

        private static string GetDataPathForResources()
        {
            string? mockClientFolder = Path.GetDirectoryName(new Uri(typeof(ResourceClientMock).Assembly.Location).LocalPath);
            return Path.Combine(mockClientFolder, "Data", "ResourceRegistry", "resources.json");
        }
    }
}
