using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for service handle agent delegation system user requests
    /// </summary>
    public interface ISystemUserAgentRequestService
    {
        /// <summary>
        /// Get a system user agent delegation request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="agentRequestId">The id of the system user agent request</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The system user request</returns>
        Task<Result<SystemUserAgentRequestFE>> GetSystemUserAgentRequest(int partyId, Guid agentRequestId, string languageCode, CancellationToken cancellationToken);
        
        /// <summary>
        /// Approve an agent delegation user request to create a new system user
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="agentRequestId">The id of the system user agent request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the create system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> ApproveSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Reject an agent delegation system user request
        /// </summary>
        /// <param name="partyId">Used to identify the party the system user request is for.</param>
        /// <param name="agentRequestId">The id of the system user agent request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean, result of the reject system user operation, or a ProblemDetails result with error</returns>
        Task<Result<bool>> RejectSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken);
    }
}