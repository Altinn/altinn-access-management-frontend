using Altinn.AccessManagement.UI.Core.Models.Altinn2User;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for adding legacy Altinn 2 user accounts.
    /// </summary>
    public interface IAltinn2UserClient
    {
        /// <summary>
        /// Adds a legacy Altinn 2 user account.
        /// </summary>
        /// <param name="request">Username and password of the legacy account.</param>
        /// <returns>The HTTP response from the platform.</returns>
        Task<HttpResponseMessage> AddAltinn2User(Altinn2UserRequest request);
    }
}
