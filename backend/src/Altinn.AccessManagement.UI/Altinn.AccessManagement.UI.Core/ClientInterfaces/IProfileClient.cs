using Altinn.Platform.Profile.Models;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with profile endpoints in access management component
    /// </summary>
    public interface IProfileClient
    {
        /// <summary>
        /// Gets the user's preferences from altinn profile
        /// </summary>
        /// <returns>users preferred settings</returns>
        Task<UserProfile> GetUserProfile(int userId);

        /// <summary>
        /// Gets the user's profile settings from altinn profile
        /// </summary>
        /// <returns>users profile settings</returns>
        Task<UserProfile> GetUserProfileByUUID(Guid uuid);
    }
}
