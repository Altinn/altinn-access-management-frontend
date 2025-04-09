using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for service handle system user requests
    /// </summary>
    public interface ISystemUserRequestService
    {
        /// <summary>
        /// Get a system user request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="requestId">The id of the system user request</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The system user request</returns>
        Task<Result<SystemUserRequestFE>> GetSystemUserRequest(Guid partyId, Guid requestId, string languageCode, CancellationToken cancellationToken);
        
        /// <summary>
        /// Approve a system user request to create a new system user
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="requestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the create system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> ApproveSystemUserRequest(Guid partyId, Guid requestId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Reject a system user request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="requestId">The id of the system user request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the rejest system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> RejectSystemUserRequest(Guid partyId, Guid requestId, CancellationToken cancellationToken);
    }
}