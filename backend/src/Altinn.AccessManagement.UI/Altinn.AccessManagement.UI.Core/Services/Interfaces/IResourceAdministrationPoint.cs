using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for creating and updating Resources in AccessMAnagment existing in the ResourceRegister
    /// </summary>
    public interface IResourceAdministrationPoint
    {
        /// <summary>
        /// Fetches the singleRights resources, processes them with filters and search string if given and then paginates the result
        /// </summary>
        /// <returns>the resources that match the filters and search string corresponding to the provided page</returns>
        Task<PaginatedList<ServiceResourceFE>> GetPaginatedSearchResults(string languageCode, string[]? resourceOwnerFilters, string? searchString, int page, int numPerPage);

        /// <summary>
        /// Gets a list of Resources from ResourceRegister
        /// </summary>
        /// <param name="resourceType">The type of resource to be filtered</param>
        /// <param name="languageCode">logged in user's preferred language</param>
        /// <returns>resource list based on resource type</returns>
        Task<List<ServiceResourceFE>> GetResources(ResourceType resourceType, string languageCode);

        /// <summary>
        /// Gets a list of Resources from ResourceRegister
        /// </summary>
        /// <param name="scopes">The scope of the resource</param>
        /// <returns>resource list based on given scope</returns>
        Task<List<ServiceResource>> GetResources(string scopes);

        /// <summary>
        /// Gets a list of Resources from ResourceRegister
        /// </summary>
        /// <param name="resourceIds">The list of resource ids</param>
        /// <returns>resource list based on given resource ids</returns>
        Task<List<ServiceResource>> GetResources(List<string> resourceIds);

        /// <summary>
        /// Integration point for retrieving a single resoure by it's resource id
        /// </summary>
        /// <param name="resourceRegistryId">The identifier of the resource in the Resource Registry</param>
        /// <returns>The resource if exists</returns>
        Task<ServiceResource> GetResource(string resourceRegistryId);
    }
}