using Altinn.AccessManagement.UI.Core.Models.Altinn2User;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for linking legacy Altinn 2 user accounts.
    /// </summary>
    public interface IAltinn2UserService
    {
        /// <summary>
        /// Adds a legacy Altinn 2 user account to the current user's account.
        /// Throws <see cref="Altinn.AccessManagement.UI.Core.Helpers.HttpStatusException"/> on failure.
        /// </summary>
        /// <param name="request">Username and password of the legacy account.</param>
        Task AddAltinn2User(Altinn2UserRequest request);
    }
}
