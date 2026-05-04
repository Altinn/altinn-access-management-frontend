using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for linking legacy Altinn 2 user accounts.
    /// </summary>
    public interface ISelfIdentifiedUserService
    {
        /// <summary>
        /// Verify and adds a legacy Altinn 2 user account to the current user's account.
        /// </summary>
        /// <param name="to">The user to a account to.</param>
        /// <param name="request">Username and password of the legacy account.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A result indicating whether the account was successfully linked.</returns>
        Task<Result<bool>> AddAltinn2User(Guid to, Altinn2UserRequest request, CancellationToken cancellationToken);
    }
}
