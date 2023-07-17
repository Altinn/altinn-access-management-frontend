using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    ///     Client implementation for integration with the Resource Registry
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class ResourceClient : IResourceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<IResourceClient> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceClient" /> classß
        /// </summary>
        /// <param name="settings">The resource registry config settings</param>
        /// <param name="logger">Logger instance for this ResourceRegistryClient</param>
        public ResourceClient(IOptions<PlatformSettings> settings, HttpClient httpClient, ILogger<IResourceClient> logger, IHttpContextAccessor httpContextAccessor)
        {
            PlatformSettings platformSettings = settings.Value;
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(platformSettings.ApiResourceRegistryEndpoint);
            _httpClient.Timeout = new TimeSpan(0, 0, 30);
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;  
        }

        /// <inheritdoc />
        public async Task<ServiceResource> GetResource(string resourceId)
        {
            ServiceResource? result = null;
            string endpointUrl = $"resource/{resourceId}";

            HttpResponseMessage response = await _httpClient.GetAsync(endpointUrl);
            if (response.StatusCode == HttpStatusCode.OK)
            {
                JsonSerializerOptions options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                string content = await response.Content.ReadAsStringAsync();
                result = JsonSerializer.Deserialize<ServiceResource>(content, options);
            }

            return await Task.FromResult(result);
        }

        /// <inheritdoc />
        public async Task<List<ServiceResource>> GetResources()
        {
            List<ServiceResource> resources = null;

            try
            {
                string endpointUrl = "resource/search";

                HttpResponseMessage response = await _httpClient.GetAsync(endpointUrl);
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    JsonSerializerOptions options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                    };
                    string content = await response.Content.ReadAsStringAsync();
                    resources = JsonSerializer.Deserialize<List<ServiceResource>>(content, options);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ResourceClient // SearchResources // Exception");
                throw;
            }

            return resources;
        }

        /// <inheritdoc />
        public async Task<OrgList> GetAllResourceOwners()
        {
            OrgList resourceOwners = new OrgList();

            string endpointUrl = "https://platform.at23.altinn.cloud/resourceregistry/api/v1/resource/orgs";

            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync(endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    JsonSerializerOptions options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                    };
                    string content = await response.Content.ReadAsStringAsync();
                    resourceOwners = JsonSerializer.Deserialize<OrgList>(content, options);
                }
                else
                {
                    _logger.LogError("Getting service owners from resourceregistry/api/v1/resource/orgs failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "AccessManagement.UI // ResourceClient // SearchResources // Exception");
                throw;
            }

            return resourceOwners;
        }

        /// <summary>
        ///     Get resource list
        /// </summary>
        /// <param name="resourceType"> the resource type</param>
        /// <returns></returns>
        public async Task<List<ServiceResource>> GetResources(ResourceType resourceType)
        {
            List<ServiceResource> resources = new List<ServiceResource>();
            ResourceSearch resourceSearch = new ResourceSearch();
            resourceSearch.ResourceType = resourceType;
            string endpointUrl = $"search?ResourceType={(int)resourceType}";

            HttpResponseMessage response = await _httpClient.GetAsync(endpointUrl);
            if (response.StatusCode == HttpStatusCode.OK)
            {
                JsonSerializerOptions options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                string content = await response.Content.ReadAsStringAsync();
                resources = JsonSerializer.Deserialize<List<ServiceResource>>(content, options);
            }

            return resources;
        }
    }
}
