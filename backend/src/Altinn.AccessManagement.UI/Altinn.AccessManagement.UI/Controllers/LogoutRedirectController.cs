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
        IOptions<GeneralSettings> generalSettings) : ControllerBase
    {
        /// <summary>
        /// Redirect to redirectUrl stored in cookie
        /// </summary>
        /// <returns></returns>
        [HttpGet("")]
        public async Task<ActionResult> RedirectAfterLogout()
        {
            string logoutInfoCookie = Request.Cookies[platformSettings.Value.AltinnLogoutInfoCookieName];
            if (!string.IsNullOrEmpty(logoutInfoCookie) && logoutInfoCookie.Contains("amSafeRedirectUrl"))
            {
                string[] values = logoutInfoCookie.Split("amSafeRedirectUrl=");

                if (values.Length == 2)
                {
                    string redirectUrl = values[1];
                    string decryptedCookieValue = await encryptionService.DecryptText(redirectUrl);
                    if (Uri.IsWellFormedUriString(decryptedCookieValue, UriKind.Absolute))
                    {
                        return Redirect(decryptedCookieValue);
                    }
                }
            }

            return Redirect(generalSettings.Value.Hostname);
        }
    }
}