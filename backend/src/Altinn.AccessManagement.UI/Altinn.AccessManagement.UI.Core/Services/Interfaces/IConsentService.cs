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
        /// <returns>List of active consents</returns>
        Task<Result<List<ConsentListItemFE>>> GetActiveConsents(Guid party, CancellationToken cancellationToken);

        /// <summary>
        /// Get a consent
        /// </summary>
        /// <param name="consentId">Id of party to consent to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>A consent</returns>
        Task<Result<ConsentFE>> GetConsent(Guid consentId, CancellationToken cancellationToken);
        
        /// <summary>
        /// Revoke a consent
        /// </summary>
        /// <param name="consentId">The consent id to revoke</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Boolean value if revoke was successful or not</returns>
        Task<Result<bool>> RevokeConsent(Guid consentId, CancellationToken cancellationToken);

        /// <summary>
        /// Get consent request redirect url
        /// </summary>
        /// <param name="consentRequestId">The consent id to approve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Redirect url</returns>
        Task<Result<string>> GetConsentRequestRedirectUrl(Guid consentRequestId, CancellationToken cancellationToken);
    }
}