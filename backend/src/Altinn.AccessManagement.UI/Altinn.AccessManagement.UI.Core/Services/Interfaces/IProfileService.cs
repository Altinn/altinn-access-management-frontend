using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.Platform.Profile.Models;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for delegations
    /// </summary>
    public interface IProfileService
    {
        /// <summary>
        /// Gets the user's preferences from altinn profile
        /// </summary>
        /// <returns>users preferred settings</returns>
        Task<UserProfile> GetUserProfile();
    }
}
