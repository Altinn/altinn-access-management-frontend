using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for verifying legacy Altinn 2 user accounts.
    /// </summary>
    public interface IAltinn2UserClient
    {
        /// <summary>
        /// Verifies a legacy Altinn 2 user account.
        /// </summary>
        /// <param name="request">Username and password of the legacy account.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A result indicating whether the verification was successful.</returns>
        Task<Result<bool>> VerifyAltinn2User(Altinn2UserRequest request, CancellationToken cancellationToken);
    }
}
