using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    ///     Interface for client integration with the Resource Registry
    /// </summary>
    public interface IResourceRegistryClient
    {
        /// <summary>
        ///     Integration point for retrieving a single resoure by it's resource id
        /// </summary>
        /// <param name="resourceId">The identifier of the resource in the Resource Registry</param>
        /// <returns>The resource if exists</returns>
        Task<ServiceResource> GetResource(string resourceId);

        /// <summary>
        ///     Integration point for retrieving a list of resources
        /// </summary>
        /// <returns>The resource list if exists</returns>
        Task<List<ServiceResource>> GetResources();

        /// <summary>
        ///     Integration point for retrieving the full list of resources
        /// </summary>
        /// <returns>The resource full list of all resources if exists</returns>
        Task<List<ServiceResource>> GetResourceList();
        
        /// <summary>
        ///     Integration point for retrieving list of resources for the given resource type
        /// </summary>
        /// <returns>The resource full list of all resources if exists</returns>
        Task<List<ServiceResource>> GetResourceList(ResourceType resourceType);

        /// <summary>
        ///     Gets list of all resource owners
        /// </summary>
        /// <returns>List of resource owners in string format</returns>
        Task<OrgList> GetAllResourceOwners();
    }
}
