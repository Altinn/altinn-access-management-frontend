using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with system user request API
    /// </summary>
    public interface ISystemUserRequestClient
    {
        /// <summary>
        /// Get a system user request
        /// </summary>
        /// <param name="requestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The system user request</returns>
        Task<Result<SystemUserRequest>> GetSystemUserRequest(Guid requestId, CancellationToken cancellationToken);

        /// <summary>
        /// Approve a system user request to create a new system user
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="requestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the create system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> ApproveSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken);

        /// <summary>
        /// Reject a system user request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="requestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the rejest system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> RejectSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken);

        /// <summary>
        /// Return all pending system user requests created for a given party
        /// </summary>
        /// <param name="partyId">The party Id of the party to retrieve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all pending system users for specified party</returns>
        Task<List<SystemUserRequest>> GetPendingSystemUserRequests(int partyId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Escalates a system user request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="requestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the escalate system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> EscalateSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken);
    }
}