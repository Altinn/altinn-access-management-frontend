using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    ///     Interface for client integration with the Resource Registry
    /// </summary>
    public interface IResourceClient
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
        ///     Gets list of all resource owners
        /// </summary>
        /// <returns>List of resource owners in string format</returns>
        Task<OrgList> GetAllResourceOwners();
    }
}
