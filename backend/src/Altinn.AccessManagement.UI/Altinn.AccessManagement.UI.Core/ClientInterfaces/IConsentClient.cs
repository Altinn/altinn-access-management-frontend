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
        /// <returns>Requested system user</returns>
        Task<Result<ConsentRequestDetails>> GetConsentRequest(Guid consentRequestId, CancellationToken cancellationToken);

        /// <summary>
        /// Gets all consent templates
        /// </summary>
        /// <returns>Consent templates</returns>
        Task<List<ConsentTemplate>> GetConsentTemplates();
    }
}