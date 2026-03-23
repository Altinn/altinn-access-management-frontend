using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with the instance delegation API.
    /// </summary>
    public interface IInstanceClient
    {
        /// <summary>
        /// Gets delegated instances for the specified parties.
        /// </summary>
        /// <param name="languageCode">The language to use in the request.</param>
        /// <param name="party">The acting party asking for the delegations.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">Optional resource identifier filter.</param>
        /// <param name="instance">Optional instance urn filter.</param>
        /// <returns>A list of delegated instances.</returns>
        Task<List<InstancePermission>> GetDelegatedInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance);

        /// <summary>
        /// Gets the rights a user can delegate on a specific instance.
        /// </summary>
        /// <param name="party">The party for which the delegation check is performed.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The delegation check result.</returns>
        Task<ResourceCheckDto> GetDelegationCheck(Guid party, string resource, string instance);

        /// <summary>
        /// Gets rights for a delegated instance.
        /// </summary>
        /// <param name="languageCode">The language to use in the request.</param>
        /// <param name="party">The acting party asking for the rights.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The delegated instance rights.</returns>
        Task<InstanceRights> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance);

        /// <summary>
        /// Delegates rights on a specific instance.
        /// </summary>
        /// <param name="party">The acting party performing the delegation.</param>
        /// <param name="to">The receiving party when delegating to an existing connection.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <param name="input">The delegation input.</param>
        /// <returns>The backend response.</returns>
        Task<HttpResponseMessage> CreateInstanceRightsAccess(Guid party, Guid? to, string resource, string instance, InstanceRightsDelegationDto input);

        /// <summary>
        /// Updates rights on a specific instance delegation.
        /// </summary>
        /// <param name="party">The acting party performing the update.</param>
        /// <param name="to">The receiving party.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <param name="actionKeys">The updated right keys.</param>
        /// <returns>The backend response.</returns>
        Task<HttpResponseMessage> UpdateInstanceRightsAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys);

        /// <summary>
        /// Gets all users who have direct access to a specific instance.
        /// </summary>
        /// <param name="party">The party UUID.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance URN.</param>
        /// <returns>A list of simplified parties representing users with access to the instance.</returns>
        Task<List<SimplifiedParty>> GetInstanceUsers(Guid party, string resource, string instance);

        /// <summary>
        /// Gets available users for instance delegation as simplified connections.
        /// This is a limited endpoint for instance admins without full admin access.
        /// </summary>
        /// <param name="party">The party UUID.</param>
        /// <returns>A list of simplified connections representing available users.</returns>
        Task<List<SimplifiedConnection>> GetAvailableUsers(Guid party);

        /// <summary>
        /// Removes an instance delegation and all its rights.
        /// </summary>
        /// <param name="party">The acting party performing the removal.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The backend response.</returns>
        Task<HttpResponseMessage> RemoveInstance(Guid party, Guid from, Guid to, string resource, string instance);
    }
}
