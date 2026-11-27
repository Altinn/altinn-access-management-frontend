using System.Configuration;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class ResourceService : IResourceService
    {
        // The most delegated single rights resources, shown first when the search string is empty
        private static readonly string[] PopularOrganizationResources =
        [
            "ske-innrapportering-amelding",
            "ske-skattekort-til-arbeidsgiver",
            "ske-informasjon-om-trekkpaalegg",
            "ske-innrapportering-aksjonaerregisteroppgave",
            "app_brg_aarsregnskap-vanlig-202406",
            "ske-krav-og-betalinger",
            "nav_sykepenger_sykmelding",
        ];

        private static readonly string[] PopularPersonResources =
        [
            "app_skd_formueinntekt-skattemelding-v2",
            "ske-arbeid-i-hjemmet-amelding",
            "ske-skatteoppgjoer-personlig",
            "app_dibk_nabovarsel-v5",
            "aarsregnskap-correspondence",
            "app_dibk_nabovarsel-svar-v5",
            "ske-utskrift-skattemelding-skatteoppgjoer",
        ];

        private readonly CacheConfig _cacheConfig;
        private readonly ILogger<IResourceService> _logger;
        private readonly IMemoryCache _memoryCache;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly IAltinnCdnService _altinnCdnService;

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
        /// <param name="altinnCdnService">the Altinn CDN service, used to look up resource owner logos</param>
        public ResourceService(
            ILogger<IResourceService> logger,
            IResourceRegistryClient resourceRegistryClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig,
            IAltinnCdnService altinnCdnService)
        {
            _logger = logger;
            _resourceRegistryClient = resourceRegistryClient;
            _altinnCdnService = altinnCdnService;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
        }

        /// <inheritdoc />
        public async Task<PaginatedList<ServiceResourceFE>> GetPaginatedSearchResults(string languageCode, PaginatedSearchParams searchParams, ResourceType[] resourceTypes = null, CancellationToken cancellationToken = default)
        {
            try
            {
                List<ServiceResource> resources = await GetFullResourceList(searchParams.IncludeExpired, cancellationToken);
                List<ServiceResource> resourceList = resources.FindAll(r => IncludeInSearch(r, searchParams, resourceTypes));
                Dictionary<string, OrgData> orgs = await _altinnCdnService.GetOrgData();
                List<ServiceResourceFE> resourcesFE = ResourceUtils.MapToServiceResourcesFE(languageCode, resourceList, orgs);

                // Perform search/filtering and return matches
                List<ServiceResourceFE> filteredresources = FilterResourceList(resourcesFE, searchParams.ROFilters);
                List<ServiceResourceFE> searchResults = SearchInResourceList(filteredresources, searchParams.SearchString, resourceTypes, cancellationToken);

                string[] popularResources = searchParams.FromPartyType switch
                {
                    PartyTypeFE.Organization => PopularOrganizationResources,
                    PartyTypeFE.Person => PopularPersonResources,
                    _ => null,
                };
                if (popularResources != null && string.IsNullOrWhiteSpace(searchParams.SearchString))
                {
                    searchResults = searchResults
                        .OrderBy(r => popularResources.Contains(r.Identifier) ? Array.IndexOf(popularResources, r.Identifier) : int.MaxValue)
                        .ToList();
                }

                return PaginationUtils.GetListPage(searchResults, searchParams.Page, searchParams.ResultsPerPage);
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceAdministrationPoint // GetResources by resourcetype failed to fetch resources {ex}", ex);
                throw;
            }
        }

        private static bool IncludeInSearch(ServiceResource resource, PaginatedSearchParams searchParams, ResourceType[] resourceTypes)
        {
            if (!resource.Visible)
            {
                return false;
            }

            if (!searchParams.IncludeExpired && IsExpiredResource(resource))
            {
                return false;
            }

            if (resourceTypes?.Length > 0)
            {
                return resourceTypes.Contains(resource.ResourceType);
            }

            return resource.ResourceType != ResourceType.MaskinportenSchema &&
                resource.ResourceType != ResourceType.Systemresource;
        }

        private static bool IsExpiredResource(ServiceResource resource)
        {
            return resource.ResourceType == ResourceType.MigratedApp ||
                resource.Status?.ToLower() == "deprecated";
        }

        /// <inheritdoc />
        public async Task<List<ServiceResourceFE>> GetResources(ResourceType resourceType, string languageCode)
        {
            try
            {
                List<ServiceResource> resources = await GetResources();
                List<ServiceResource> resourceList = resources.FindAll(r => r.ResourceType == resourceType && r.Delegable && r.Visible);
                Dictionary<string, OrgData> orgs = await _altinnCdnService.GetOrgData();
                return ResourceUtils.MapToServiceResourcesFE(languageCode, resourceList, orgs);
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
        public async Task<ServiceResourceFE> GetResource(string resourceRegistryId, string languageCode)
        {
            try
            {
                ServiceResource resource = await GetResource(resourceRegistryId);
                if (resource == null)
                {
                    return null;
                }

                Dictionary<string, OrgData> orgs = await _altinnCdnService.GetOrgData();
                return ResourceUtils.MapToServiceResourceFE(resource, languageCode, orgs);
            }
            catch (Exception ex)
            {
                _logger.LogError("//ResourceService //GetResource failed to fetch resource {ex}", ex);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Dictionary<string, ServiceResourceFE>> GetResourcesFE(IEnumerable<string> resourceIds, string languageCode, CancellationToken cancellationToken = default)
        {
            Dictionary<string, ServiceResourceFE> result = [];
            List<string> uniqueIds = resourceIds?.Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList() ?? [];
            if (uniqueIds.Count == 0)
            {
                return result;
            }

            Dictionary<string, OrgData> orgs = await _altinnCdnService.GetOrgData();

            // Load resources one at a time to avoid starting all requests in parallel. Lookups are cached.
            foreach (string resourceId in uniqueIds)
            {
                ServiceResource resource = await TryGetResource(resourceId, cancellationToken);
                if (resource != null)
                {
                    result[resourceId] = ResourceUtils.MapToServiceResourceFE(resource, languageCode, orgs);
                }
            }

            return result;
        }

        private async Task<ServiceResource> TryGetResource(string resourceId, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                return await GetResource(resourceId);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // One unresolvable resource must not cost the remaining ones their details.
                _logger.LogError(ex, "ResourceService failed to look up resource {ResourceId} from the resource registry", resourceId);
                return null;
            }
        }

        /// <inheritdoc />
        public async Task<List<ResourceOwnerFE>> GetResourceOwners(List<ResourceType> relevantResourceTypeList, string languageCode)
        {
            try
            {
                List<ServiceResource> resources = await GetResources();

                string ResolveOrganisationName(Dictionary<string, string> translations)
                {
                    if (translations == null)
                    {
                        return null;
                    }

                    if (!string.IsNullOrEmpty(languageCode) && translations.TryGetValue(languageCode, out string localizedName))
                    {
                        return localizedName;
                    }

                    return translations.TryGetValue("nb", out string defaultName) ? defaultName : null;
                }

                // Filter resources based on criteria and remove duplicates based on OrganisationName
                var resourceOwnerList = resources
                    .Where(sr => sr.HasCompetentAuthority != null
                                 && !string.IsNullOrEmpty(sr.HasCompetentAuthority.Orgcode)
                                 && relevantResourceTypeList.Contains(sr.ResourceType))
                    .GroupBy(sr => sr.HasCompetentAuthority.Orgcode, StringComparer.OrdinalIgnoreCase)
                    .Select(g =>
                    {
                        ServiceResource preferred = g.FirstOrDefault(sr => !string.IsNullOrWhiteSpace(ResolveOrganisationName(sr.HasCompetentAuthority?.Name)));
                        return preferred ?? g.First();
                    })
                    .Select(sr =>
                    {
                        string organisationName = ResolveOrganisationName(sr.HasCompetentAuthority?.Name);

                        return new ResourceOwnerFE(organisationName, sr.HasCompetentAuthority.Organization)
                        {
                            OrganisationCode = sr.HasCompetentAuthority.Orgcode,
                        };
                    })
                    .OrderBy(resourceOwner => resourceOwner.OrganisationName ?? resourceOwner.OrganisationCode, StringComparer.OrdinalIgnoreCase) // Order alphabetically
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

        private List<ResourceOwnerFE> MapOrgListToResourceOwnerFe(OrgList orgList, string languageCode)
        {
            return orgList.Orgs?
               .Select(org => new ResourceOwnerFE(org.Value.Name != null ? GetNameInCorrectLanguage(org.Value.Name, languageCode) : null, org.Value.Orgnr)
               {
                   OrganisationCode = org.Key,
               })
                .ToList() ?? new List<ResourceOwnerFE>();
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

        private async Task<List<ServiceResource>> GetFullResourceList(bool includeMigratedApps = false, CancellationToken cancellationToken = default)
        {
            string cacheKey = $"resourcesList:all:{includeMigratedApps}";

            if (!_memoryCache.TryGetValue(cacheKey, out List<ServiceResource> resources))
            {
                cancellationToken.ThrowIfCancellationRequested();
                resources = await _resourceRegistryClient.GetResourceList(includeMigratedApps);

                MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.High)
                    .SetAbsoluteExpiration(new TimeSpan(0, _cacheConfig.ResourceRegistryResourceCacheTimeout, 0));

                _memoryCache.Set(cacheKey, resources, cacheEntryOptions);
            }

            return resources;
        }

        /// <summary>
        ///     Filters the provided list of resources based on provided resourceOwnerFilters.
        ///     <param name="resources">The list of resources to be filtered.</param>
        ///     <param name="resourceOwnerFilters">The list of resource owners (OrgCodes) to be included in the returned list.</param>
        /// </summary>
        /// <returns>List of filtered resources or all resources if the list of filters is null or empty</returns>
        private List<ServiceResourceFE> FilterResourceList(List<ServiceResourceFE> resources, string[] resourceOwnerFilters)
        {
            if (resourceOwnerFilters == null || resourceOwnerFilters.Length == 0)
            {
                return resources;
            }

            List<ServiceResourceFE> filteredResources = new List<ServiceResourceFE>();
            string[] resourceOwnerFiltersLowercase = resourceOwnerFilters.Select(filter => filter.ToLower()).ToArray();

            foreach (ServiceResourceFE res in resources)
            {
                if (resourceOwnerFiltersLowercase.Contains(res.ResourceOwnerOrgcode.ToLower()))
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
        ///     <param name="resourceTypes">Optional resource types included in the search.</param>
        ///     <param name="cancellationToken">Cancellation token.</param>
        /// </summary>
        /// <returns>
        ///     List of resources containing at least one word from the search string, ordered by the number of word
        ///     occurences found. Returns the full list of resources if the search string is null or empty.
        /// </returns>
        private List<ServiceResourceFE> SearchInResourceList(List<ServiceResourceFE> resources, string searchString, ResourceType[] resourceTypes = null, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            string trimmedSearchString = searchString?.Trim();
            if (string.IsNullOrEmpty(trimmedSearchString))
            {
                return resources;
            }

            bool includeResourceReferencesInSearch = resourceTypes?.Contains(ResourceType.MaskinportenSchema) == true;
            List<ServiceResourceFE> matchedResources = new List<ServiceResourceFE>();
            string[] searchWords = trimmedSearchString.ToLower().Split();

            foreach (ServiceResourceFE res in resources)
            {
                int matchScore = 0;

                foreach (string word in searchWords)
                {
                    bool titleMatch = StringUtils.NotNullAndContains(res.Title, word);

                    if (titleMatch
                    || StringUtils.NotNullAndContains(res.Description, word)
                    || StringUtils.NotNullAndContains(res.RightDescription, word)
                    || StringUtils.NotNullAndContains(res.ResourceOwnerName, word)
                    || StringUtils.NotNullAndContains(res.Identifier, word)
                    || (includeResourceReferencesInSearch && ResourceReferenceContains(res, word))
                    || (res.Keywords != null && res.Keywords.Exists((kw) => StringUtils.NotNullAndContains(kw, word))))
                    {
                        matchScore++;
                    }

                    if (titleMatch)
                    {
                        matchScore++; // Extra weight for title matches, so they outrank matches in other fields
                    }
                }

                if (matchScore > 0)
                {
                    res.PriorityCounter = matchScore;
                    if (res.Identifier != null && string.Equals(trimmedSearchString, res.Identifier.Trim(), StringComparison.OrdinalIgnoreCase))
                    {
                        res.PriorityCounter += 2; // Prioritize resources whose identifier is an exact match
                    }

                    if (res.Title != null && string.Equals(trimmedSearchString, res.Title.Trim(), StringComparison.OrdinalIgnoreCase))
                    {
                        res.PriorityCounter += 2; // Prioritize resources whose title is an exact match
                    }

                    if (includeResourceReferencesInSearch && HasExactResourceReferenceMatch(res, trimmedSearchString))
                    {
                        res.PriorityCounter += 2; // Prioritize resources whose scope is an exact match
                    }

                    matchedResources.Add(res);
                }
            }

            List<ServiceResourceFE> sortedMatches = matchedResources.OrderByDescending(res => res.PriorityCounter).ToList();

            return sortedMatches;
        }

        private static bool ResourceReferenceContains(ServiceResourceFE resource, string word)
        {
            return resource.ResourceReferences?.Exists(reference =>
                reference != null &&
                reference.ReferenceType == ReferenceType.MaskinportenScope &&
                StringUtils.NotNullAndContains(reference.Reference, word)) == true;
        }

        private static bool HasExactResourceReferenceMatch(ServiceResourceFE resource, string searchString)
        {
            return resource.ResourceReferences?.Exists(reference =>
                reference != null &&
                reference.ReferenceType == ReferenceType.MaskinportenScope &&
                reference.Reference != null &&
                string.Equals(searchString, reference.Reference.Trim(), StringComparison.OrdinalIgnoreCase)) == true;
        }
    }
}
