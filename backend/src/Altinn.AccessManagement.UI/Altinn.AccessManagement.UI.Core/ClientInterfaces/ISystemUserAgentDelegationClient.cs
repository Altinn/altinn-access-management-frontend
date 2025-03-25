using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with the systemuser client delegation API
    /// </summary>
    public interface ISystemUserAgentDelegationClient
    {
        /// <summary>
        /// Return delegated customers for this system user
        /// </summary>
        /// <param name="partyId">The party id of the party owning system user to retrieve delegated customers from</param>
        /// <param name="facilitatorId">Facilitator uuid, uuid of partyId</param>
        /// <param name="systemUserGuid">The system user UUID to retrieve delegated customers from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of delegated customers for system user</returns>
        Task<List<AgentDelegation>> GetSystemUserAgentDelegations(int partyId, Guid facilitatorId, Guid systemUserGuid, CancellationToken cancellationToken);

        /// <summary>
        /// Add client to system user
        /// </summary>
        /// <param name="partyId">The party id of the party owning system user to add customer to</param>
        /// <param name="systemUserGuid">The system user UUID to add customer to</param>
        /// <param name="delegationRequest">The party uuid of the customer to add + partyUuid of system user owner party</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of AgentDelegation objects with delegation info</returns>
        Task<Result<List<AgentDelegation>>> AddClient(int partyId, Guid systemUserGuid, AgentDelegationRequest delegationRequest, CancellationToken cancellationToken);

        /// <summary>
        /// Remove client from system user
        /// </summary>
        /// <param name="facilitatorId">Facilitator uuid, uuid of partyId</param>
        /// <param name="delegationId">The delegation id to remove</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean result of remove</returns>
        Task<Result<bool>> RemoveClient(Guid facilitatorId, Guid delegationId, CancellationToken cancellationToken);
    }
}