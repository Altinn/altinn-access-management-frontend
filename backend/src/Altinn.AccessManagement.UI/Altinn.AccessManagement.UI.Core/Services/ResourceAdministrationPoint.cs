using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class ResourceAdministrationPoint : IResourceAdministrationPoint
    {
        private readonly ILogger<IResourceAdministrationPoint> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly CacheConfig _cacheConfig;

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceAdministrationPoint"/> class.
        /// </summary>
        /// <param name="logger">Logger instance.</param>
        /// <param name="resourceRegistryClient">the handler for resource registry client</param>
        /// <param name="cacheConfig">the handler for cache configuration</param>
        /// <param name="memoryCache">the handler for cache</param>
        public ResourceAdministrationPoint(
            ILogger<IResourceAdministrationPoint> logger, 
            IResourceRegistryClient resourceRegistryClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig)
        {
            _logger = logger;
            _resourceRegistryClient = resourceRegistryClient;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
        }

        /// <inheritdoc />
        public async Task<List<ServiceResourceFE>> GetResources(ResourceType resourceType, string languageCode)
        {
            try
            {
                List<ServiceResource> resources = await GetResources();
                List<ServiceResource> resourceList = resources.FindAll(r => r.ResourceType == resourceType);
                return MapResourceToFrontendModel(resourceList, languageCode);
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceAdministrationPoint //GetResources by resourcetype failed to fetch resources", ex);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<ServiceResource>> GetResources(string scopes)
        {
            List<ServiceResource> filteredResources = new List<ServiceResource>();

            List<ServiceResource> resources = await GetResources();

            foreach (ServiceResource resource in resources)
            {
                foreach (ResourceReference reference in resource.ResourceReferences)
                {
                    if (reference != null && reference.Reference.Equals(scopes) && reference.ReferenceType == ReferenceType.MaskinportenScope)
                    {
                        filteredResources.Add(resource);
                    }
                }
            }

            return filteredResources;
        }

        /// <inheritdoc />
        public async Task<List<ServiceResource>> GetResources(List<string> resourceIds)
        {
            List<ServiceResource> filteredResources = new List<ServiceResource>();

            try
            {
                foreach (string id in resourceIds)
                {
                    ServiceResource resource = null;

                    resource = await GetResource(id);

                    if (resource == null)
                    {
                        ServiceResource unavailableResource = new ServiceResource
                        {
                            Identifier = id,
                            Title = new Dictionary<string, string>
                        {
                            { "en", "Not Available" },
                            { "nb", "ikke tilgjengelig" },
                            { "nn", "ikkje tilgjengelig" }
                        },
                            ResourceType = ResourceType.Default
                        };
                        filteredResources.Add(unavailableResource);
                    }
                    else
                    {
                        filteredResources.Add(resource);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceAdministrationPoint //GetResources by resource id failed to fetch resources", ex);
                throw;
            }

            return filteredResources;
        }

        /// <inheritdoc />
        public async Task<ServiceResource> GetResource(string resourceRegistryId)
        {
            string cacheKey = $"rrId:{resourceRegistryId}";

            if (!_memoryCache.TryGetValue(cacheKey, out ServiceResource resource))
            {
                resource = await _resourceRegistryClient.GetResource(resourceRegistryId);

                var cacheEntryOptions = new MemoryCacheEntryOptions()
               .SetPriority(CacheItemPriority.High)
               .SetAbsoluteExpiration(new TimeSpan(0, _cacheConfig.ResourceRegistryResourceCacheTimeout, 0));

                _memoryCache.Set(cacheKey, resource, cacheEntryOptions);
            }

            return resource;
        }

        private async Task<List<ServiceResource>> GetResources()
        {
            string cacheKey = $"resources:all";

            if (!_memoryCache.TryGetValue(cacheKey, out List<ServiceResource> resources))
            {
                resources = await _resourceRegistryClient.GetResources();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
               .SetPriority(CacheItemPriority.High)
               .SetAbsoluteExpiration(new TimeSpan(0, _cacheConfig.ResourceRegistryResourceCacheTimeout, 0));

                _memoryCache.Set(cacheKey, resources, cacheEntryOptions);
            }

            return resources;
        }

        private List<ServiceResourceFE> MapResourceToFrontendModel(List<ServiceResource> resources, string languageCode)
        {
            List<ServiceResourceFE> resourceList = new List<ServiceResourceFE>();
            foreach (var resource in resources)
            {
                ServiceResourceFE resourceFE = new ServiceResourceFE();
                resourceFE.Title = resource?.Title?.GetValueOrDefault(languageCode) ?? resource?.Title?.GetValueOrDefault("nb");
                resourceFE.ResourceType = resource.ResourceType;
                resourceFE.Status = resource?.Status;
                resourceFE.ResourceReferences = resource?.ResourceReferences;
                resourceFE.Identifier = resource?.Identifier;
                resourceFE.ResourceOwnerName = resource?.HasCompetentAuthority?.Name?.GetValueOrDefault(languageCode) ?? resource?.HasCompetentAuthority?.Name?.GetValueOrDefault("nb");
                resourceFE.RightDescription = resource?.RightDescription?.GetValueOrDefault(languageCode) ?? resource?.RightDescription?.GetValueOrDefault("nb");
                resourceFE.Description = resource?.Description?.GetValueOrDefault(languageCode) ?? resource?.Description?.GetValueOrDefault("nb");
                resourceFE.ValidFrom = resource.ValidFrom;
                resourceFE.ValidTo = resource.ValidTo;
                resourceList.Add(resourceFE);
            }

            return resourceList;
        }
    }
}