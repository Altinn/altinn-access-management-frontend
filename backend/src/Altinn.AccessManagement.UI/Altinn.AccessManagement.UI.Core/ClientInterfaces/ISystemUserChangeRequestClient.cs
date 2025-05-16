using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with system user change request API
    /// </summary>
    public interface ISystemUserChangeRequestClient
    {
        /// <summary>
        /// Get a system user change request
        /// </summary>
        /// <param name="changeRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The system user request</returns>
        Task<Result<SystemUserChangeRequest>> GetSystemUserChangeRequest(Guid changeRequestId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Approve a system user change request to create a new system user
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="changeRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the create system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> ApproveSystemUserChangeRequest(int partyId, Guid changeRequestId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Reject a system user change request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="changeRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the rejest system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> RejectSystemUserChangeRequest(int partyId, Guid changeRequestId, CancellationToken cancellationToken);
    }
}