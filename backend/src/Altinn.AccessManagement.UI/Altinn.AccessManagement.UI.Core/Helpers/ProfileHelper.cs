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

        /// <summary>
        /// Gets the standard language code
        /// </summary>
        /// <param name="userProfile">the logged in user profile</param>
        /// <returns>the logged in users language preference</returns>
        public static string GetStandardLanguageCodeForUser(UserProfile userProfile)
        {
            if (userProfile != null)
            {
                switch (userProfile.ProfileSettingPreference?.Language)
                {
                    case "nn":
                        return "no_nn";
                    case "nb":
                        return "no_nb";
                    case "en":
                        return "en";
                    default:
                        return "no_nb";
                }
            }
            
            return "no_nb";
        }
    }
}
