using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for linking legacy Altinn 2 user accounts.
    /// </summary>
    public interface ISelfIdentifiedUserService
    {
        /// <summary>
        /// Verifies a legacy Altinn 2 user account and returns the party UUID.
        /// </summary>
        /// <param name="request">Username and password of the legacy account.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The party UUID of the verified Altinn 2 user.</returns>
        Task<Guid> ValidateCredentials(Altinn2AccountRequest request, CancellationToken cancellationToken);

        /// <summary>
        /// Creates a self-identified user connection between two parties.
        /// </summary>
        /// <param name="from">The party UUID of the Altinn 2 user.</param>
        /// <param name="to">The party UUID to connect to.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task PostNewSelfIdentifiedUser(Guid from, Guid to, CancellationToken cancellationToken);

        /// <summary>
        /// Sends a forgot password email for a legacy Altinn 2 user account.
        /// </summary>
        /// <param name="request">Username of the legacy account.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Altinn2ForgotPasswordResponse> SendForgotPasswordEmail(Altinn2ForgotPasswordRequest request, CancellationToken cancellationToken);

        /// <summary>
        ///  Verifies a token user has received by email.
        /// </summary>
        /// <param name="request">Object with token</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<Guid> AddAltinn2AccountFromToken(Altinn2AccountFromTokenRequest request, CancellationToken cancellationToken);
    }
}
