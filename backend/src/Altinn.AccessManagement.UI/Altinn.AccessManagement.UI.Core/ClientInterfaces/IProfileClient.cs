using Altinn.Platform.Profile.Models;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with profile endpoints in access management component
    /// </summary>
    public interface IProfileClient
    {
        /// <summary>
        /// Gets user's preferences
        /// </summary>
        /// <returns></returns>
        Task<UserProfile> GetUserProfile();
    }
}
