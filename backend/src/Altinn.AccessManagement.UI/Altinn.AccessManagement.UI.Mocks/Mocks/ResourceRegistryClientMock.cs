using System.Net;
using System.Net.Http;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
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
        public async Task<ServiceResource> GetResource(string resourceId, string versionId = null)
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
        public Task<List<ServiceResource>> GetResourceList(bool includeMigratedApps = false)
        {
            return GetResources();
        }

        /// <inheritdoc />
        public Task<OrgList> GetAllResourceOwners()
        {
            string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            if (!string.IsNullOrEmpty(folder))
            {
                string path = Path.Combine(folder, "Data", "ResourceRegistry", "resourceowners.json");
                OrgList orgList = Util.GetMockData<OrgList>(path);
                return Task.FromResult(orgList);
            }

            return Task.FromResult<OrgList>(null);
        }

        public Task<List<Right>> GetResourceRights(string resourceId, string languageCode = "nb")
        {
            if (resourceId == "internal-error-trigger")
            {
                throw new Exception("Mock internal error");
            }

            try
            {
                string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
                string dataPath = Path.Combine(folder, "Data", "SingleRight", "DelegationCheck", $"{resourceId}.json");
                return Task.FromResult(Util.GetMockData<ResourceCheckDto>(dataPath)?.Rights.Select(r => r.Right).ToList());
            }
            catch
            {
                throw new HttpStatusException("StatusError", "Unexpected mockResponse status from Access Management", HttpStatusCode.BadRequest, "");
            }
        }

        private static string GetResourcePath(string resourceRegistryId)
        {
            string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(folder, "Data", "ResourceRegistry", $"{resourceRegistryId}", "resource.json");
        }

        private static string GetDataPathForResources()
        {
            string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(folder, "Data", "ResourceRegistry", "resources.json");
        }
    }
}
