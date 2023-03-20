using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Integration.Clients;

namespace Altinn.AccessManagement.UI.Tests.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IResourceRegistryClient"></see> interface
    /// </summary>
    public class ResourceRegistryClientMock : IResourceRegistryClient
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceRegistryClient"/> class
        /// </summary>
        public ResourceRegistryClientMock()
        {
        }

        /// <inheritdoc/>
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

        /// <inheritdoc/>
        public Task<List<ServiceResource>> GetResources()
        {
            List<ServiceResource> resources = new List<ServiceResource>();

            string path = GetDataPathForResources();

            if (File.Exists(path))
            {

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };

                string content = File.ReadAllText(path);
                resources = JsonSerializer.Deserialize<List<ServiceResource>>(content, options);

            }
            return Task.FromResult(resources);
        }

        private static string GetResourcePath(string resourceRegistryId)
        {
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "..", "..", "..", "Data", "ResourceRegistry", $"{resourceRegistryId}", "resource.json");
        }

        private static string GetDataPathForResources()
        {
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "ResourceRegistry", "resources.json");
        }
    }
}
