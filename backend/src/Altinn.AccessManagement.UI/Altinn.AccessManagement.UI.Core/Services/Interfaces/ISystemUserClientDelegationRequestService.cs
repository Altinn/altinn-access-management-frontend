using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for service handle client delegation system user requests
    /// </summary>
    public interface ISystemUserClientDelegationRequestService
    {
        /// <summary>
        /// Get a system user client delegation request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="clientDelegationRequestId">The id of the system user request</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The system user request</returns>
        Task<Result<SystemUserClientDelegationRequestFE>> GetSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, string languageCode, CancellationToken cancellationToken);
        
        /// <summary>
        /// Approve a system client delegation user request to create a new system user
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="clientDelegationRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the create system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> ApproveSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Reject a client delegation system user request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="clientDelegationRequestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the reject system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> RejectSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken);
    }
}