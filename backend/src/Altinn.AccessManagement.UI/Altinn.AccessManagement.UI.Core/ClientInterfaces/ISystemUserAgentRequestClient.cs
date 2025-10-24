using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with system user agent delegation request API
    /// </summary>
    public interface ISystemUserAgentRequestClient
    {
        /// <summary>
        /// Get a system user agent delegation request
        /// </summary>
        /// <param name="agentRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The system user request</returns>
        Task<Result<SystemUserRequest>> GetSystemUserAgentRequest(Guid agentRequestId, CancellationToken cancellationToken);

        /// <summary>
        /// Approve a system user agent delegation request to create a new system user
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="agentRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the create system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> ApproveSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken);

        /// <summary>
        /// Reject a system user agent delegation request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="agentRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the rejest system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> RejectSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken);

        /// <summary>
        /// Return all pending agent system user requests created for a given party
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all system users for specified party</returns>
        Task<List<SystemUserRequest>> GetPendingAgentSystemuserRequests(int partyId, CancellationToken cancellationToken);

        /// <summary>
        /// Escalates an agent system user request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="agentRequestId">The id of the system user agent request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the reject system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> EscalateSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken);
    }
}