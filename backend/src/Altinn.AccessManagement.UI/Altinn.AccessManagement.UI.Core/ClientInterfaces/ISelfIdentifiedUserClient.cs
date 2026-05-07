using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for verifying legacy Altinn 2 user accounts.
    /// </summary>
    public interface ISelfIdentifiedUserClient
    {
        /// <summary>
        /// Validates the credentials of a legacy Altinn 2 user account.
        /// </summary>
        /// <param name="request">Username and password of the legacy account.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The partyUuid of the user</returns>
        Task<Guid> ValidateCredentials(Altinn2UserRequest request, CancellationToken cancellationToken);
    }
}
