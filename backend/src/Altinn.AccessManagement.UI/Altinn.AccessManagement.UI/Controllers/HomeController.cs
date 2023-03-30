﻿using System.Web;
using Altinn.AccessManagement.Models;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Platform.Profile.Models;
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
        private readonly IProfileService _profileService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly GeneralSettings _generalSettings;

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
            IProfileService profileService,
            IHttpContextAccessor httpContextAccessor,
            IOptions<GeneralSettings> generalSettings)
        {
            _antiforgery = antiforgery;
            _platformSettings = platformSettings.Value;
            _env = env;
            _profileService = profileService;
            _httpContextAccessor = httpContextAccessor;
            _generalSettings = generalSettings.Value;
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
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            var user = await _profileService.GetUserProfile(userId);
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            string languageCode = ProfileHelper.GetLanguageCodeForUser(user);

            HttpContext.Response.Cookies.Append(_generalSettings.LanguageCookie, languageCode, new CookieOptions
            {
                HttpOnly = false // Make this cookie readable by Javascript.
            });
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
