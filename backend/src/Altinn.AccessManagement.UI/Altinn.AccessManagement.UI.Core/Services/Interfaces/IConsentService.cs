using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for consent endpoints
    /// </summary>
    public interface IConsentService
    {
        /// <summary>
        /// Return a consent request
        /// </summary>
        /// <param name="consentRequestId">The consent id to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>A consent request</returns>
        Task<Result<ConsentRequestFE>> GetConsentRequest(Guid consentRequestId, CancellationToken cancellationToken);

        /// <summary>
        /// Rejects a consent request
        /// </summary>
        /// <param name="consentRequestId">The consent id to reject</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean value if reject was successful or not</returns>
        Task<Result<bool>> RejectConsentRequest(Guid consentRequestId, CancellationToken cancellationToken);

        /// <summary>
        /// Approves a consent request
        /// </summary>
        /// <param name="consentRequestId">The consent id to approve</param>
        /// <param name="context">Context when approving</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean value if approve was successful or not</returns>
        Task<Result<bool>> ApproveConsentRequest(Guid consentRequestId, ApproveConsentContext context, CancellationToken cancellationToken);

        /// <summary>
        /// Gets list of active consents
        /// </summary>
        /// <param name="party">Id of party to get active consents for</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean value if approve was successful or not</returns>
        Task<Result<List<ConsentListItemFE>>> GetActiveConsents(Guid party, CancellationToken cancellationToken);
    }
}