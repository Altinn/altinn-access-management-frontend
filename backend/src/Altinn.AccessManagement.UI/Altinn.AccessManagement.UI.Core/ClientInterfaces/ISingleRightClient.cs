using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with the single rights API
    /// </summary>
    public interface ISingleRightClient
    {
        /// <summary>
        ///    Fetches all actions on a given resource with details on whether they can be delegated on behalf of the fromParty
        /// </summary>
        /// <param name="from">The party from which the delegation would be on behalf of</param>
        /// <param name="resource">The id of the resource to be checked for delegation</param>
        Task<ResourceCheckDto> GetDelegationCheck(Guid from, string resource);

        /// <summary>
        ///    Creates a new delegation of a service with rights
        /// </summary>
        /// <param name="party">The party that is performing the access delegation</param>
        /// <param name="to">The id of the right holder that will receive the access</param>
        /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
        /// <param name="resourceId">The id of the resource/service to be delegated</param>
        /// <param name="actionKeys">The ids of the specific rights/actions to be granted</param>
        Task<HttpResponseMessage> CreateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys);

        /// <summary>
        ///    Updates an already existing delegation of a service with rights
        /// </summary>
        /// <param name="party">The party that is performing the access delegation</param>
        /// <param name="to">The id of the right holder that will receive the access</param>
        /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
        /// <param name="resourceId">The id of the resource/service to be delegated</param>
        /// <param name="actionKeys">The updated list of actions that the toParty should hold on the resource</param>
        Task<HttpResponseMessage> UpdateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys);

        /// <summary>
        /// Revokes all rights on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="party">The acting party that performs the revoking.</param>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeResourceDelegation(Guid party, Guid from, Guid to, string resourceId);
    }
}
