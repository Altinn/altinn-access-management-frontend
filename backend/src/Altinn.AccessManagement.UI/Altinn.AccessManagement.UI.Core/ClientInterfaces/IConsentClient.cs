using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with the consent API
    /// </summary>
    public interface IConsentClient
    {
        /// <summary>
        /// Return a consent request
        /// </summary>
        /// <param name="consentRequestId">The id of the consentRequest to retrieve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Requested consent request</returns>
        Task<Result<ConsentRequestDetails>> GetConsentRequest(Guid consentRequestId, CancellationToken cancellationToken);

        /// <summary>
        /// Rejects a consent request
        /// </summary>
        /// <param name="consentRequestId">The id of the consentRequest to reject</param>
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
        /// Gets all consent templates
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Consent templates</returns>
        Task<List<ConsentTemplate>> GetConsentTemplates(CancellationToken cancellationToken);

        /// <summary>
        /// Gets all active consents
        /// </summary>
        /// <param name="party">Id of party to get active consents for</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Active consents</returns>
        Task<Result<List<Consent>>> GetActiveConsents(Guid party, CancellationToken cancellationToken);

        /// <summary>
        /// Gets all active consents
        /// </summary>
        /// <param name="consentId">Id of consent to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>A consent</returns>
        Task<Result<Consent>> GetConsent(Guid consentId, CancellationToken cancellationToken);
    }
}