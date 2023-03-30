﻿using System.Web;
using Altinn.AccessManagement.Models;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement
{
    /// <summary>
    /// HomeController
    /// </summary>
    [Route("accessmanagement/")]
    [Route("accessmanagement/ui")]
    [Route("accessmanagement/ui/{*AnyValue}")]
    public class HomeController : Controller
    {
        private readonly IAntiforgery _antiforgery;
        private readonly PlatformSettings _platformSettings;
        private readonly IWebHostEnvironment _env;
        private readonly IProfileClient _profileClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="HomeController"/> class.
        /// </summary>
        /// <param name="frontEndEntrypoints">Configuration of frontend entry points</param>
        /// <param name="antiforgery">the anti forgery service</param>
        /// <param name="platformSettings">settings related to the platform</param>
        /// <param name="env">the current environment</param>
        public HomeController(
            IOptions<FrontEndEntryPointOptions> frontEndEntrypoints,
            IAntiforgery antiforgery,
            IOptions<PlatformSettings> platformSettings,
            IWebHostEnvironment env,
            IProfileClient profileClient)
        {
            _antiforgery = antiforgery;
            _platformSettings = platformSettings.Value;
            _env = env;
            _profileClient = profileClient;
        }

        /// <summary>
        /// Gets the app frontend view for Accessmanagement
        /// </summary>
        /// <returns>View result</returns>
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // See comments in the configuration of Antiforgery in MvcConfiguration.cs.
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            if (_env.IsDevelopment())
            {
                HttpContext.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions
                {
                    HttpOnly = false // Make this cookie readable by Javascript.
                });
            }
            else
            {
                HttpContext.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions
                {
                    Secure = true,
                    HttpOnly = false // Make this cookie readable by Javascript.
                });
            }

            await SetLanguageCookie();

            if (ShouldShowAppView())
            {
                return View();
            
            }

            string goToUrl = HttpUtility.UrlEncode($"{_platformSettings.AltinnPlatformBaseUrl}{Request.Path}");
            string redirectUrl = $"{_platformSettings.ApiAuthenticationEndpoint}authentication?goto={goToUrl}";

            return Redirect(redirectUrl);
        }

        private async Task SetLanguageCookie()
        {
            var user = await _profileClient.GetUserProfile();
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            
            if(user.ProfileSettingPreference.Language.Equals("en"))
            {
                HttpContext.Response.Cookies.Append("i18next", "no_nb", new CookieOptions
                {
                    HttpOnly = false // Make this cookie readable by Javascript.
                });
            }
            else if(user.ProfileSettingPreference.Language.Equals("nn"))
            {
                HttpContext.Response.Cookies.Append("i18next", "no_nn", new CookieOptions
                {
                    HttpOnly = false // Make this cookie readable by Javascript.
                });
            }
            else
            {
                HttpContext.Response.Cookies.Append("i18next", "no_nb", new CookieOptions
                {
                    HttpOnly = false // Make this cookie readable by Javascript.
                });
            }
        }

        private bool ShouldShowAppView()
        {
            if (User.Identity.IsAuthenticated)
            {
                return true;
            }

            return false;
        }
    }
}
