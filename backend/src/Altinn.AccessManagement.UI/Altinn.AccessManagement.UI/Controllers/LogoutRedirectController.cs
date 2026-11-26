using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller to redirect user after logout after approve/reject systemuser request or consent request
    /// </summary>
    /// <remarks>
    /// Constructor for <see cref="LogoutRedirectController"/>
    /// </remarks>
    [Route("accessmanagement/api/v1/logoutredirect")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class LogoutRedirectController(
        IEncryptionService encryptionService,
        IOptions<PlatformSettings> platformSettings,
        IOptions<GeneralSettings> generalSettings,
        ILogger<LogoutRedirectController> logger) : ControllerBase
    {
        /// <summary>
        /// Redirect to redirectUrl stored in cookie
        /// </summary>
        /// <returns></returns>
        [HttpGet("")]
        public async Task<ActionResult> RedirectAfterLogout()
        {
            string logoutInfoCookie = Request.Cookies[platformSettings.Value.AltinnLogoutInfoCookieName];

            CookieOptions opt = new CookieOptions() { Domain = generalSettings.Value.Hostname, Secure = true, HttpOnly = true };
            Response.Cookies.Delete(platformSettings.Value.AltinnLogoutInfoCookieName, opt);

            string fallbackUrl = $"https://{generalSettings.Value.Hostname}";

            if (string.IsNullOrEmpty(logoutInfoCookie))
            {
                logger.LogWarning("LogoutRedirect: logout info cookie missing, redirecting to fallback");
                return Redirect(fallbackUrl);
            }

            if (!logoutInfoCookie.Contains("amSafeRedirectUrl"))
            {
                logger.LogWarning("LogoutRedirect: logout info cookie has no amSafeRedirectUrl, redirecting to fallback");
                return Redirect(fallbackUrl);
            }

            string[] values = logoutInfoCookie.Split("amSafeRedirectUrl=");
            if (values.Length != 2)
            {
                logger.LogWarning("LogoutRedirect: unexpected cookie format, split produced {PartCount} parts (cookie length {CookieLength}), redirecting to fallback", values.Length, logoutInfoCookie.Length);
                return Redirect(fallbackUrl);
            }

            string decryptedCookieValue;
            try
            {
                decryptedCookieValue = await encryptionService.DecryptText(values[1]);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "LogoutRedirect: failed to decrypt amSafeRedirectUrl (encrypted length {EncryptedLength})", values[1].Length);
                throw;
            }

            if (!Uri.IsWellFormedUriString(decryptedCookieValue, UriKind.Absolute))
            {
                // Log only the host (if parsable) and length: the query string may contain authorization codes
                string host = Uri.TryCreate(decryptedCookieValue, UriKind.Absolute, out Uri parsed) ? parsed.Host : "<unparsable>";
                logger.LogWarning("LogoutRedirect: decrypted redirect url is not well-formed (host {Host}, length {UrlLength}), redirecting to fallback", SanitizeForLog(host), decryptedCookieValue?.Length ?? 0);
                return Redirect(fallbackUrl);
            }

            logger.LogInformation("LogoutRedirect: redirecting to {Host}", SanitizeForLog(new Uri(decryptedCookieValue).Host));
            return Redirect(decryptedCookieValue);
        }

        /// <summary>
        /// Strips line breaks so a value derived from the cookie cannot forge extra log entries.
        /// </summary>
        private static string SanitizeForLog(string value)
        {
            return value.Replace("\r", string.Empty).Replace("\n", string.Empty);
        }
    }
}
