using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    ///     Client implementation for integration with the Resource Registry
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class ResourceRegistryClient : IResourceRegistryClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<IResourceRegistryClient> _logger;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceRegistryClient" /> classß
        /// </summary>
        /// <param name="settings">The resource registry config settings</param>
        /// <param name="logger">Logger instance for this ResourceRegistryClient</param>
        public ResourceRegistryClient(IOptions<PlatformSettings> settings, HttpClient httpClient, ILogger<IResourceRegistryClient> logger)
        {
            PlatformSettings platformSettings = settings.Value;
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(platformSettings.ApiResourceRegistryEndpoint);
            _httpClient.Timeout = new TimeSpan(0, 0, 30);
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _logger = logger;
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
                // Weird enough it's not possible to filter on AltinnApp or GenericAccessResource for this endpoint
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

            string endpointUrl = "resource/orgs";

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
        ///     Gets all resources no matter if it's an AltinnApp or GenericAccessResource
        /// </summary>
        /// <returns>List of all resources</returns>
        public async Task<List<ServiceResource>> GetResourceList()
        {
            List<ServiceResource> resources = null;

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };
            try
            {
                string endpointUrl = "resource/resourcelist";

                HttpResponseMessage response = await _httpClient.GetAsync(endpointUrl);
                string content = await response.Content.ReadAsStringAsync();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return JsonSerializer.Deserialize<List<ServiceResource>>(content, options);
                }

                HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(content, options);
                throw error;
            }
            catch (Exception ex) when (ex is not HttpStatusException)
            {
                _logger.LogError(ex, "AccessManagement.UI // ResourceRegistryClient // ResourceList // Exception");
                throw;
            }

            return resources;
        }

        /// <summary>
        ///     Gets all MaskinportenSchemas
        /// </summary>
        /// <returns>MaskinportenSchemas</returns>
        public async Task<List<ServiceResource>> GetMaskinportenSchemas()
        {
            List<ServiceResource> resources = new List<ServiceResource>();
            
            // Weird enough it's not possible to filter on AltinnApp or GenericAccessResource for this endpoint
            string endpointUrl = $"search?ResourceType={(int)ResourceType.MaskinportenSchema}";

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
