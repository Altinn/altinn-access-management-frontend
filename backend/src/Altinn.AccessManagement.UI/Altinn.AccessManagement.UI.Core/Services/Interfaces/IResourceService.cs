using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    ///     Service for resources existing in the ResourceRegister.
    /// </summary>
    public interface IResourceService
    {
        /// <summary>
        ///     Fetches the singleRights resources, processes them with filters and search string if given and then paginates the
        ///     result.
        /// </summary>
        /// <param name="languageCode">languageCode.</param>
        /// <param name="resourceOwnerFilters">resourceOwnerFilters.</param>
        /// <param name="searchString">searchString.</param>
        /// <param name="page">page.</param>
        /// <param name="resultsPerPage">resultsPerPage.</param>
        /// <returns>the resources that match the filters and search string corresponding to the provided page.</returns>
        Task<PaginatedList<ServiceResourceFE>> GetPaginatedSearchResults(string languageCode, string[] resourceOwnerFilters, string searchString, int page, int resultsPerPage);

        /// <summary>
        ///     Searches through all maskinporten schema services and returns matches.
        /// </summary>
        /// <param name="languageCode">languageCode.</param>
        /// <param name="resourceOwnerFilters">resourceOwnerFilters.</param>
        /// <param name="searchString">searchString.</param>
        /// <returns>List of resource owners.</returns>
        public Task<List<ServiceResourceFE>> MaskinportenschemaSearch(string languageCode, string[] resourceOwnerFilters, string searchString);

        /// <summary>
        ///     Gets a list of Resources from ResourceRegister.
        /// </summary>
        /// <param name="resourceType">The type of resource to be filtered.</param>
        /// <param name="languageCode">logged in user's preferred language.</param>
        /// <returns>resource list based on resource type.</returns>
        Task<List<ServiceResourceFE>> GetResources(ResourceType resourceType, string languageCode);

        /// <summary>
        ///     Gets a list of Resources from ResourceRegister.
        /// </summary>
        /// <param name="scopes">The scope of the resource.</param>
        /// <returns>resource list based on given scope.</returns>
        Task<List<ServiceResource>> GetResources(string scopes);

        /// <summary>
        ///     Gets a list of Resources from ResourceRegister.
        /// </summary>
        /// <param name="resourceIds">The list of resource ids.</param>
        /// <returns>resource list based on given resource ids.</returns>
        Task<List<ServiceResource>> GetResources(List<string> resourceIds);

        /// <summary>
        ///     Integration point for retrieving a single resoure by it's resource id.
        /// </summary>
        /// <param name="resourceRegistryId">The identifier of the resource in the Resource Registry.</param>
        /// <returns>The resource if exists.</returns>
        Task<ServiceResource> GetResource(string resourceRegistryId);

        /// <summary>
        ///     Gets list of all resource owners.
        /// </summary>
        /// <returns>Simplified list of resource owners for frontend.</returns>
        Task<List<ResourceOwnerFE>> GetAllResourceOwners(string languageCode);

        /// <summary>
        ///     Gets list of resource owners for given resource type.
        /// </summary>
        /// <returns>Simplified list of resource owners for frontend.</returns>
        Task<List<ResourceOwnerFE>> GetResourceOwners(List<ResourceType> relevantResourceTypeList, string languageCode);
    }
}
