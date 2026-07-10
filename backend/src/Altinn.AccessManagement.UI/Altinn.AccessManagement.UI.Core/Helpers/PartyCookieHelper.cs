using Microsoft.AspNetCore.Http;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Helper for writing the AltinnPartyId / AltinnPartyUuid cookies that carry the active reportee context.
    /// </summary>
    public static class PartyCookieHelper
    {
        /// <summary>
        /// Cookie name for the active reportee party id.
        /// </summary>
        public const string AltinnPartyIdCookieName = "AltinnPartyId";

        /// <summary>
        /// Cookie name for the active reportee party uuid.
        /// </summary>
        public const string AltinnPartyUuidCookieName = "AltinnPartyUuid";

        /// <summary>
        /// Writes the AltinnPartyId cookie to the response with consistent options.
        /// </summary>
        /// <param name="response">The HTTP response to write the cookie to.</param>
        /// <param name="partyId">The party id value.</param>
        /// <param name="hostname">Cookie domain. Omitted when null/empty.</param>
        /// <param name="secure">When true, the cookie is marked Secure and only travels over HTTPS. Pass false in local dev over HTTP.</param>
        public static void WritePartyIdCookie(HttpResponse response, string partyId, string hostname, bool secure)
        {
            response.Cookies.Append(AltinnPartyIdCookieName, partyId, BuildOptions(hostname, secure));
        }

        /// <summary>
        /// Writes the AltinnPartyUuid cookie to the response with consistent options.
        /// </summary>
        /// <param name="response">The HTTP response to write the cookie to.</param>
        /// <param name="partyUuid">The party uuid value.</param>
        /// <param name="hostname">Cookie domain. Omitted when null/empty.</param>
        /// <param name="secure">When true, the cookie is marked Secure and only travels over HTTPS. Pass false in local dev over HTTP.</param>
        public static void WritePartyUuidCookie(HttpResponse response, string partyUuid, string hostname, bool secure)
        {
            response.Cookies.Append(AltinnPartyUuidCookieName, partyUuid, BuildOptions(hostname, secure));
        }

        /// <summary>
        /// Writes both AltinnPartyId and AltinnPartyUuid cookies to the response.
        /// </summary>
        public static void WritePartyCookies(HttpResponse response, int partyId, System.Guid partyUuid, string hostname, bool secure)
        {
            WritePartyIdCookie(response, partyId.ToString(), hostname, secure);
            WritePartyUuidCookie(response, partyUuid.ToString(), hostname, secure);
        }

        private static CookieOptions BuildOptions(string hostname, bool secure)
        {
            CookieOptions options = new CookieOptions
            {
                HttpOnly = false,
                Secure = secure,
                Path = "/",
                SameSite = SameSiteMode.Lax,
            };

            if (!string.IsNullOrWhiteSpace(hostname))
            {
                options.Domain = hostname;
            }

            return options;
        }
    }
}
