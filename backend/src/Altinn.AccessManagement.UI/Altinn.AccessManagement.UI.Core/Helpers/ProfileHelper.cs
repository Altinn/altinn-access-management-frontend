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
        /// Gets the users language preference in Altinn format
        /// </summary>
        /// <param name="userProfile">the logged in user profile</param>
        /// <returns>the logged in users language preference in Altinn format</returns>
        public static string GetLanguageCodeForUserAltinnStandard(UserProfile userProfile, HttpContext httpContext)
        {
            string languageCookieValue = GetAltinnPersistenceCookieValueAltinnStandard(httpContext);

            if (languageCookieValue != string.Empty)
            {
                return languageCookieValue;
            }
            
            if (userProfile != null)
            {
                return userProfile.ProfileSettingPreference.Language;
            }
            
            return "nb";
        }

        /// <summary>
        /// Gets the standard language code in ISO format
        /// </summary>
        /// <returns>the logged in users language on ISO format</returns>
        public static string GetStandardLanguageCodeIsoStandard(UserProfile userProfile, HttpContext httpContext)
        {
            string languageCookieValue = GetAltinnPersistenceCookieValueIsoStandard(httpContext);

            if (languageCookieValue != string.Empty)
            {
                return languageCookieValue;
            }
            
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
        
        private static string GetAltinnPersistenceCookieValueAltinnStandard(HttpContext httpContext)
        {
            var cookieValue = httpContext.Request.Cookies["altinnPersistentContext"];

            if (cookieValue == null)
            {
                return string.Empty;
            }

            if (cookieValue.Contains("UL=1033"))
            {
                return "en";
            }

            if (cookieValue.Contains("UL=1044"))
            {
                return "nb";
            }

            if (cookieValue.Contains("UL=2068"))
            {
                return "nn";
            }
            
            return string.Empty;
        }
        
        private static string GetAltinnPersistenceCookieValueIsoStandard(HttpContext httpContext)
        {
            var cookieValue = httpContext.Request.Cookies["altinnPersistentContext"];

            if (cookieValue == null)
            {
                return string.Empty;
            }
            
            if (cookieValue.Contains("UL=1033"))
            {
                return "en";
            }

            if (cookieValue.Contains("UL=1044"))
            {
                return "no_nb";
            }

            if (cookieValue.Contains("UL=2068"))
            {
                return "no_nn";
            }
            
            return string.Empty;
        }
    }
}
