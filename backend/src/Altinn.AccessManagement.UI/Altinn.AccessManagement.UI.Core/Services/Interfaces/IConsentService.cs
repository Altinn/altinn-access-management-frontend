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
    }
}