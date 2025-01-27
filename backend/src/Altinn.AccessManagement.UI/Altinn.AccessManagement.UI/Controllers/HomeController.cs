using System.Web;
using Altinn.AccessManagement.Models;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     HomeController
    /// </summary>
    [Route("accessmanagement/")]
    [Route("accessmanagement/ui")]
    [Route("accessmanagement/ui/{*AnyValue}")]
    public class HomeController : Controller
    {
        private readonly IAntiforgery _antiforgery;
        private readonly IWebHostEnvironment _env;
        private readonly GeneralSettings _generalSettings;
        private readonly FeatureFlags _featureFlags;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IUserService _userService;

        /// <summary>
        ///     Initializes a new instance of the <see cref="HomeController" /> class.
        /// </summary>
        /// <param name="frontEndEntrypoints">Configuration of frontend entry points</param>
        /// <param name="antiforgery">the anti forgery service</param>
        /// <param name="platformSettings">settings related to the platform</param>
        /// <param name="env">the current environment</param>
        /// <param name="userService">service implementation for user profile</param>
        /// <param name="httpContextAccessor">http context</param>
        /// <param name="generalSettings">general settings</param>
        /// <param name="featureFlags">feature flags</param>
        public HomeController(
            IOptions<FrontEndEntryPointOptions> frontEndEntrypoints,
            IAntiforgery antiforgery,
            IOptions<PlatformSettings> platformSettings,
            IWebHostEnvironment env,
            IUserService userService,
            IHttpContextAccessor httpContextAccessor,
            IOptions<GeneralSettings> generalSettings,
            IOptions<FeatureFlags> featureFlags)
        {
            _antiforgery = antiforgery;
            _platformSettings = platformSettings.Value;
            _env = env;
            _userService = userService;
            _httpContextAccessor = httpContextAccessor;
            _generalSettings = generalSettings.Value;
            _featureFlags = featureFlags.Value;
        }

        /// <summary>
        ///     Gets the app frontend view for Accessmanagement
        /// </summary>
        /// <returns>View result</returns>
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // See comments in the configuration of Antiforgery in MvcConfiguration.cs.
            AntiforgeryTokenSet tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            if (_env.IsDevelopment())
            {
                HttpContext.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions
                {
                    HttpOnly = false, // Make this cookie readable by Javascript.
                    SameSite = SameSiteMode.Strict
                });
            }
            else
            {
                HttpContext.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions
                {
                    Secure = true,
                    HttpOnly = false, // Make this cookie readable by Javascript.
                    SameSite = SameSiteMode.Strict
                });
            }

            HttpContext.Response.Cookies.Append("AltinnPartyUuid", "cd35779b-b174-4ecc-bbef-ece13611be7f", new CookieOptions
            {
                Secure = true,
                HttpOnly = false, // Make this cookie readable by Javascript.
                SameSite = SameSiteMode.Strict
            });

            if (await ShouldShowAppView())
            {
                ViewBag.featureFlags = _featureFlags;
                return View();
            }

            string goToUrl = HttpUtility.UrlEncode($"{_generalSettings.FrontendBaseUrl}{Request.Path}{Request.QueryString}");
            string redirectUrl = $"{_platformSettings.ApiAuthenticationEndpoint}authentication?goto={goToUrl}";
            
            return Redirect(redirectUrl);
        }

        private async Task SetLanguageCookie()
        {
            // Get the language code from the Altinn persistence cookie
            string languageCode = LanguageHelper.GetAltinnPersistenceCookieValueFrontendStandard(_httpContextAccessor.HttpContext);
            
            // If the language code is not found in the Altinn persistence cookie, get the language code from user profile.
            if (string.IsNullOrEmpty(languageCode))
            {
                int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
                UserProfileFE user = await _userService.GetUserProfile(userId);
                languageCode = LanguageHelper.GetFrontendStandardLanguage(user?.ProfileSettingPreference?.Language);
            }

            HttpContext.Response.Cookies.Append("selectedLanguage", languageCode ?? "no_nb", new CookieOptions
            {
                // Make this cookie readable by Javascript.
                HttpOnly = false,
                SameSite = SameSiteMode.Strict
            });
        }

        private async Task<bool> ShouldShowAppView()
        {
            if (User.Identity.IsAuthenticated)
            {
                await SetLanguageCookie();
                return true;
            }

            return false;
        }
    }
}
