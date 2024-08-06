using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class ResourceService : IResourceService
    {
        private readonly CacheConfig _cacheConfig;
        private readonly ILogger<IResourceService> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IResourceRegistryClient _resourceRegistryClient;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceService" /> class for testing purposes.
        /// </summary>
        public ResourceService()
        {
        }

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceService" /> class.
        /// </summary>
        /// <param name="logger">Logger instance.</param>
        /// <param name="resourceRegistryClient">the handler for resource registry client</param>
        /// <param name="cacheConfig">the handler for cache configuration</param>
        /// <param name="memoryCache">the handler for cache</param>
        public ResourceService(
            ILogger<IResourceService> logger,
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
        public async Task<PaginatedList<ServiceResourceFE>> GetPaginatedSearchResults(string languageCode, string[] resourceOwnerFilters, string searchString, int page, int resultsPerPage)
        {
            try
            {
                List<ServiceResource> resources = await GetFullResourceList();
                List<ServiceResource> resourceList = resources.FindAll(r => r.ResourceType != ResourceType.MaskinportenSchema && r.ResourceType != ResourceType.SystemResource && r.Delegable && r.Visible);
                List<ServiceResourceFE> resourcesFE = MapResourceToFrontendModel(resourceList, languageCode);

                List<ServiceResourceFE> filteredresources = FilterResourceList(resourcesFE, resourceOwnerFilters);
                List<ServiceResourceFE> searchResults = SearchInResourceList(filteredresources, searchString);
                return PaginationUtils.GetListPage(searchResults, page, resultsPerPage);
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceAdministrationPoint // GetResources by resourcetype failed to fetch resources {ex}", ex);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<ServiceResourceFE>> GetResources(ResourceType resourceType, string languageCode)
        {
            try
            {
                List<ServiceResource> resources = await GetResources();
                List<ServiceResource> resourceList = resources.FindAll(r => r.ResourceType == resourceType && r.Delegable && r.Visible);
                return MapResourceToFrontendModel(resourceList, languageCode);
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceService //GetResources by resourcetype failed to fetch resources {ex}", ex);
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
                                { "nn", "ikkje tilgjengelig" },
                            },
                            ResourceType = ResourceType.Default,
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
                _logger.LogError("//ResourceService //GetResources by resource id failed to fetch resources {ex}", ex);
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

                MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.High)
                    .SetAbsoluteExpiration(new TimeSpan(0, _cacheConfig.ResourceRegistryResourceCacheTimeout, 0));

                _memoryCache.Set(cacheKey, resource, cacheEntryOptions);
            }

            return resource;
        }

        /// <inheritdoc />
        public async Task<List<ResourceOwnerFE>> GetResourceOwners(List<ResourceType> relevantResourceTypeList, string languageCode)
        {
            try
            {
                List<ServiceResource> resources = await GetResources();

                // Filter resources based on criteria and remove duplicates based on OrganisationName
                var resourceOwnerList = resources
                    .Where(sr => sr.HasCompetentAuthority != null && sr.HasCompetentAuthority.Name != null
                                 && sr.HasCompetentAuthority.Name.ContainsKey(languageCode)
                                 && relevantResourceTypeList.Contains(sr.ResourceType))
                    .GroupBy(sr => sr.HasCompetentAuthority.Orgcode.ToUpper())
                    .Select(g => g.First()) // Take the first item from each group to eliminate duplicates
                    .Select(sr => new ResourceOwnerFE(
                        sr.HasCompetentAuthority.Name[languageCode],
                        sr.HasCompetentAuthority.Organization))
                    .OrderBy(resourceOwner => resourceOwner.OrganisationName) // Order alphabetically
                    .ToList();

                return resourceOwnerList;
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceService // GetResourceOwners failed {ex}", ex);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<ResourceOwnerFE>> GetAllResourceOwners(string languageCode)
        {
            JsonSerializerOptions options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };
            OrgList orgList = new OrgList();
            try
            {
                orgList = await _resourceRegistryClient.GetAllResourceOwners();
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceService //GetAllResourceOwners failed, exception: {Ex}", ex);
            }

            return MapOrgListToResourceOwnerFe(orgList, languageCode)
                .OrderBy(resorceOwner => resorceOwner.OrganisationName) // Order alphabetically
                .ToList();
        }

        /// <inheritdoc />
        public async Task<List<ServiceResourceFE>> MaskinportenschemaSearch(string languageCode, string[] resourceOwnerFilters, string searchString)
        {
            try
            {
                List<ServiceResource> resources = await _resourceRegistryClient.GetMaskinportenSchemas();
                List<ServiceResource> resourceList = resources.FindAll(r => r.ResourceType == ResourceType.MaskinportenSchema && r.Visible && r.Delegable);
                List<ServiceResourceFE> resourcesFE = MapResourceToFrontendModel(resourceList, languageCode);

                List<ServiceResourceFE> filteredresources = FilterResourceList(resourcesFE, resourceOwnerFilters);
                return SearchInResourceList(filteredresources, searchString);
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceService // MaskinportenschemaSearch failed {ex}", ex);
                throw;
            }
        }

        private List<ResourceOwnerFE> MapOrgListToResourceOwnerFe(OrgList orgList, string languageCode)
        {
            return orgList.Orgs.Values
                .Select(org => new ResourceOwnerFE(GetNameInCorrectLanguage(org.Name, languageCode), org.Orgnr))
                .ToList();
        }

        private static string GetNameInCorrectLanguage(Name name, string languageCode)
        {
            switch (languageCode.ToLowerInvariant())
            {
                case "en":
                    return name.En;
                case "nb":
                    return name.Nb;
                case "nn":
                    return name.Nn;
                default:
                    return name.Nb;
            }
        }

        private async Task<List<ServiceResource>> GetResources()
        {
            string cacheKey = "resources:all";
            
            if (!_memoryCache.TryGetValue(cacheKey, out List<ServiceResource> resources))
            {
                resources = await _resourceRegistryClient.GetResources();

                MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.High)
                    .SetAbsoluteExpiration(new TimeSpan(0, _cacheConfig.ResourceRegistryResourceCacheTimeout, 0));

                _memoryCache.Set(cacheKey, resources, cacheEntryOptions);
            }

            return resources;
        }

        private async Task<List<ServiceResource>> GetFullResourceList()
        {
            return await _resourceRegistryClient.GetResourceList();
        }

        /// <summary>
        ///     Filters the provided list of resources based on provided resourceOwnerFilters.
        ///     <param name="resources">The list of resources to be filtered.</param>
        ///     <param name="resourceOwnerFilters">The list of resource owners to be included in the returned list.</param>
        /// </summary>
        /// <returns>List of filtered resources or all resources if the list of filters is null or empty</returns>
        private List<ServiceResourceFE> FilterResourceList(List<ServiceResourceFE> resources, string[] resourceOwnerFilters)
        {
            if (resourceOwnerFilters == null || resourceOwnerFilters.Length == 0)
            {
                return resources;
            }

            List<ServiceResourceFE> filteredResources = new List<ServiceResourceFE>();

            foreach (ServiceResourceFE res in resources)
            {
                if (resourceOwnerFilters.Contains(res.ResourceOwnerOrgNumber))
                {
                    filteredResources.Add(res);
                }
            }

            return filteredResources;
        }

        /// <summary>
        ///     Searches through a list of resources after occurences of the words in a search string, resturning a list of
        ///     resources where at least one of these words are present.
        ///     <param name="resources">The list of resources to be searched through.</param>
        ///     <param name="searchString">The search string to be used for the search.</param>
        /// </summary>
        /// <returns>
        ///     List of resources containing at least one word from the search string, ordered by the number of word
        ///     occurences found. Returns the full list of resources if the search string is null or empty.
        /// </returns>
        private List<ServiceResourceFE> SearchInResourceList(List<ServiceResourceFE> resources, string searchString)
        {
            if (string.IsNullOrEmpty(searchString))
            {
                return resources;
            }

            List<ServiceResourceFE> matchedResources = new List<ServiceResourceFE>();
            string[] searchWords = searchString.Trim().ToLower().Split();

            foreach (ServiceResourceFE res in resources)
            {
                int numMatches = 0;

                foreach (string word in searchWords)
                {
                    if (StringUtils.NotNullAndContains(res.Title, word) || StringUtils.NotNullAndContains(res.Description, word) || StringUtils.NotNullAndContains(res.RightDescription, word) || StringUtils.NotNullAndContains(res.ResourceOwnerName, word))
                    {
                        numMatches++;
                    }
                }

                if (numMatches > 0)
                {
                    res.PriorityCounter = numMatches;

                    if (res.Title != null && searchString.Trim().ToLower() == res.Title.Trim().ToLower())
                    {
                        res.PriorityCounter++; // Prioritize resources who's title is an exact match
                    }

                    matchedResources.Add(res);
                }
            }

            List<ServiceResourceFE> sortedMatches = matchedResources.OrderByDescending(res => res.PriorityCounter).ToList();

            return sortedMatches;
        }

        private List<ServiceResourceFE> MapResourceToFrontendModel(List<ServiceResource> resources, string languageCode)
        {
            List<ServiceResourceFE> resourceList = new List<ServiceResourceFE>();
            foreach (ServiceResource resource in resources)
            {
                if (resource != null)
                {
                    ServiceResourceFE resourceFE = new ServiceResourceFE(
                        resource.Identifier,
                        resource.Title?.GetValueOrDefault(languageCode) ?? resource.Title?.GetValueOrDefault("nb"),
                        resourceType: resource.ResourceType,
                        status: resource.Status,
                        resourceReferences: resource.ResourceReferences,
                        resourceOwnerName: resource.HasCompetentAuthority?.Name?.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority?.Name?.GetValueOrDefault("nb"),
                        resourceOwnerOrgNumber: resource.HasCompetentAuthority?.Organization,
                        rightDescription: resource.RightDescription?.GetValueOrDefault(languageCode) ?? resource.RightDescription?.GetValueOrDefault("nb"),
                        description: resource.Description?.GetValueOrDefault(languageCode) ?? resource.Description?.GetValueOrDefault("nb"),
                        visible: resource.Visible,
                        delegable: resource.Delegable,
                        contactPoints: resource.ContactPoints,
                        spatial: resource.Spatial,
                        authorizationReference: resource.AuthorizationReference);

                    resourceList.Add(resourceFE);
                }
            }

            return resourceList;
        }
    }
}
