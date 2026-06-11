using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for verifying legacy Altinn 2 user accounts.
    /// </summary>
    public interface ISelfIdentifiedUserClient
    {
        /// <summary>
        /// Links a legacy Altinn 2 user account to logged in users account.
        /// </summary>
        /// <param name="request">Username and password of the legacy account.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The partyUuid of the user</returns>
        Task<Guid> AddAltinn2Account(Altinn2AccountRequest request, CancellationToken cancellationToken);

        /// <summary>
        /// Sends a forgot password email for a legacy Altinn 2 user account.
        /// </summary>
        /// <param name="request">Username of the legacy account.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The email address of the user</returns>
        Task<Altinn2ForgotPasswordResponse> SendForgotPasswordEmail(Altinn2ForgotPasswordRequest request, CancellationToken cancellationToken);
        
        /// <summary>
        /// Validates a token user has received by email.
        /// </summary>
        /// <param name="request">Object with token.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The partyUuid of the user</returns>
        Task<Guid> AddAltinn2AccountFromToken(Altinn2AccountFromTokenRequest request, CancellationToken cancellationToken);
    }
}
