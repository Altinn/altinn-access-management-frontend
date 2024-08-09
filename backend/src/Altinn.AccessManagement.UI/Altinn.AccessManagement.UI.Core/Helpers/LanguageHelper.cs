using Microsoft.AspNetCore.Http;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Helper class for user language.
    /// </summary>
    public static class LanguageHelper
    {
        // Lanugage mappings between Altinn 2, backend standard and frontend standard.
        private static readonly List<(string Altinn2Standard, string BackendStandard, string FrontendStandard)> LanguageMappings = new List<(string, string, string)>
        {
            ("UL=1044", "nb", "no_nb"), // Norwegian Bokmål
            ("UL=2068", "nn", "no_nn"), // Norwegian Nynorsk
            ("UL=1033", "en", "en") // English
        };

        /// <summary>
        /// Gets the backend standard language based on the either Altinn 2 or frontend standard.
        /// </summary>
        /// <param name="languageCode">The language code.</param>
        /// <returns>The backend standard language code.</returns>
        public static string GetBackendStandardLanguage(string languageCode)
        {
            return LanguageMappings.FirstOrDefault(m => languageCode.Contains(m.Altinn2Standard) || m.FrontendStandard == languageCode).BackendStandard;
        }

        /// <summary>
        /// Gets the frontend standard language based on the either Altinn 2 or backend standard.
        /// </summary>
        /// <param name="languageCode">The language code.</param>
        /// <returns>The frontend standard language code.</returns>
        public static string GetFrontendStandardLanguage(string languageCode)
        {
            return LanguageMappings.FirstOrDefault(m => languageCode.Contains(m.Altinn2Standard) || m.BackendStandard == languageCode).FrontendStandard;
        }

        /// <summary>
        /// Gets the value of the Altinn persistence cookie in frontend standard format.
        /// </summary>
        /// <param name="httpContext">The HTTP context.</param>
        /// <returns>The value of the Altinn persistence cookie.</returns>
        public static string GetAltinnPersistenceCookieValueFrontendStandard(HttpContext httpContext)
        {
            var cookieValue = httpContext.Request.Cookies["altinnPersistentContext"];

            if (cookieValue == null)
            {
                return string.Empty;
            }

            return GetFrontendStandardLanguage(cookieValue);
        }

        /// <summary>
        /// Gets the value of the selected language cookie in backend standard format.
        /// </summary>
        /// <param name="httpContext">The HTTP context.</param>
        /// <returns>The value of the selected language cookie.</returns>
        public static string GetSelectedLanguageCookieValueBackendStandard(HttpContext httpContext)
        {
            var cookieValue = httpContext.Request.Cookies["selectedLanguage"];

            if (cookieValue == null)
            {
                return string.Empty;
            }

            return GetBackendStandardLanguage(cookieValue);
        }
    }
}
