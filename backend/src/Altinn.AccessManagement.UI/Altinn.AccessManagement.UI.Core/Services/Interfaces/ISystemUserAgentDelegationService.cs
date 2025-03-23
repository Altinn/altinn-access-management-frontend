using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// The "middleware" between the BFF's SystemUserAPI and Altinn's real SystemUserAPI in the Authentication Component
    /// </summary>
    public interface ISystemUserAgentDelegationService
    {
        /// <summary>
        /// Return all customers for given system user
        /// </summary>
        /// <param name="partyId">The party id of the party owning system user</param>
        /// <param name="partyUuid">The party uuid of the party owning system user</param>
        /// <param name="systemUserGuid">The system user UUID to get customers from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all systemuser customers</returns>
        Task<List<AgentDelegationPartyFE>> GetSystemUserCustomers(int partyId, Guid partyUuid, Guid systemUserGuid, CancellationToken cancellationToken);

        /// <summary>
        /// Return delegated customers for this system user
        /// </summary>
        /// <param name="partyId">The party UUID of the party owning system user to retrieve delegated customers from</param>
        /// <param name="facilitatorId">Facilitator uuid, uuid of partyId</param>
        /// <param name="systemUserGuid">The system user UUID to retrieve delegated customers from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of delegated customers for system user</returns>
        Task<List<AgentDelegationFE>> GetSystemUserAgentDelegations(int partyId, Guid facilitatorId, Guid systemUserGuid, CancellationToken cancellationToken);

        /// <summary>
        /// Add client to system user
        /// </summary>
        /// <param name="partyId">The party id of the party owning system user to add customer to</param>
        /// <param name="systemUserGuid">The system user UUID to add customer to</param>
        /// <param name="delegationRequest">Payload to send to add client</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>AgentDelegationFE with assignment id and customer id</returns>
        Task<Result<AgentDelegationFE>> AddClient(int partyId, Guid systemUserGuid, AgentDelegationRequest delegationRequest, CancellationToken cancellationToken);

        /// <summary>
        /// Remove client from system user
        /// </summary>
        /// <param name="partyId">The party id of the party owning system user to remove customer from</param>
        /// <param name="systemUserGuid">The system user UUID to remove customer from</param>
        /// <param name="assignmentId">The assignment id to remove</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean result of remove</returns>
        Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, Guid assignmentId, CancellationToken cancellationToken);
    }
}