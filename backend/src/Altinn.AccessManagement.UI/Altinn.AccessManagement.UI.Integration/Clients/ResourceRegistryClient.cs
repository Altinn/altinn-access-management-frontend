using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.Extensions.Caching.Memory;
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

        private readonly CacheConfig _cacheConfig;
        private readonly IMemoryCache _memoryCache;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceRegistryClient" /> classß
        /// </summary>
        /// <param name="settings">The resource registry config settings</param>
        /// <param name="httpClient">Http client</param>
        /// <param name="logger">Logger instance for this ResourceRegistryClient</param>
        /// <param name="memoryCache">the handler for cache</param>
        /// <param name="cacheConfig">the handler for cache configuration</param>
        public ResourceRegistryClient(
            IOptions<PlatformSettings> settings,
            HttpClient httpClient,
            ILogger<IResourceRegistryClient> logger,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig)
        {
            PlatformSettings platformSettings = settings.Value;
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(platformSettings.ApiResourceRegistryEndpoint);
            _httpClient.Timeout = new TimeSpan(0, 0, 30);
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _logger = logger;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
        }

        /// <inheritdoc />
        public async Task<ServiceResource> GetResource(string resourceId)
        {
            ServiceResource result = null;
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
                // It's not possible to filter on AltinnApp or Altinn2Service for this endpoint
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
            string endpointUrl = "resource/orgs";
            string cacheKey = "all_resource_owners";
            if (!_memoryCache.TryGetValue(cacheKey, out OrgList resourceOwners))
            {
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
                        var ro = JsonSerializer.Deserialize<OrgList>(content, options);
                        MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                            .SetPriority(CacheItemPriority.High)
                            .SetAbsoluteExpiration(new TimeSpan(0, _cacheConfig.ResourceOwnerCacheTimeout, 0));

                        _memoryCache.Set(cacheKey, resourceOwners, cacheEntryOptions);
                        return ro;
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
            }

            return resourceOwners;

        }

        /// <summary>
        ///     Gets all resources no matter if it's an AltinnApp or GenericAccessResource
        /// </summary>
        /// <returns>List of all resources</returns>
        public async Task<List<ServiceResource>> GetResourceList()
        {
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
        }

        /// <summary>
        ///     Gets all MaskinportenSchemas
        /// </summary>
        /// <returns>MaskinportenSchemas</returns>
        public async Task<List<ServiceResource>> GetMaskinportenSchemas()
        {
            List<ServiceResource> resources = new List<ServiceResource>();

            // Weird enough it's not possible to filter on AltinnApp or Altinn2Service for this endpoint
            string endpointUrl = $"resource/search?ResourceType={(int)ResourceType.MaskinportenSchema}";

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
