using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with system user client delegation request API
    /// </summary>
    public interface ISystemUserClientRequestClient
    {
        /// <summary>
        /// Get a system user client delegation request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="clientRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The system user request</returns>
        Task<Result<SystemUserClientRequest>> GetSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Approve a system user client delegation request to create a new system user
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="clientRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the create system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> ApproveSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Reject a system user client delegation request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="clientRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the rejest system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> RejectSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken);
    }
}