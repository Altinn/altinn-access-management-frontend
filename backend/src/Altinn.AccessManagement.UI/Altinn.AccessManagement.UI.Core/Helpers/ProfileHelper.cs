using System.Security.Claims;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Http;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// helper class for authentication
    /// </summary>
    public static class ProfileHelper
    {
        /// <summary>
        /// Gets the users language preference
        /// </summary>
        /// <param name="userProfile">the logged in user profile</param>
        /// <returns>the logged in users language preference</returns>
        public static string GetLanguageCodeForUser(UserProfile userProfile)
        {
            if (userProfile != null)
            {
                return userProfile.ProfileSettingPreference.Language;
            }
            else
            {
                return "nb";
            }
        }
    }
}
