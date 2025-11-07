using System.Web;
using Altinn.AccessManagement.Models;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Integration.Configuration;
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

        /// <summary>
        ///     Initializes a new instance of the <see cref="HomeController" /> class.
        /// </summary>
        /// <param name="frontEndEntrypoints">Configuration of frontend entry points</param>
        /// <param name="antiforgery">the anti forgery service</param>
        /// <param name="platformSettings">settings related to the platform</param>
        /// <param name="env">the current environment</param>
        /// <param name="httpContextAccessor">http context</param>
        /// <param name="generalSettings">general settings</param>
        /// <param name="featureFlags">feature flags</param>
        public HomeController(
            IOptions<FrontEndEntryPointOptions> frontEndEntrypoints,
            IAntiforgery antiforgery,
            IOptions<PlatformSettings> platformSettings,
            IWebHostEnvironment env,
            IHttpContextAccessor httpContextAccessor,
            IOptions<GeneralSettings> generalSettings,
            IOptions<FeatureFlags> featureFlags)
        {
            _antiforgery = antiforgery;
            _platformSettings = platformSettings.Value;
            _env = env;
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

            if (await ShouldShowAppView())
            {
                ViewBag.featureFlags = _featureFlags;
                return View();
            }

            string goToUrl = HttpUtility.UrlEncode($"{_generalSettings.FrontendBaseUrl}{Request.Path}{Request.QueryString}");
            string redirectUrl = $"{_platformSettings.ApiAuthenticationEndpoint}authentication?goto={goToUrl}";

            return Redirect(redirectUrl);
        }

        private Task SetLanguageCookie()
        {
            var httpContext = _httpContextAccessor.HttpContext;

            string languageCode = LanguageHelper.GetAltinnPersistenceCookieValueFrontendStandard(httpContext);

            if (string.IsNullOrEmpty(languageCode))
            {
                languageCode = httpContext?.Request.Cookies["selectedLanguage"];
            }

            if (string.IsNullOrEmpty(languageCode))
            {
                languageCode = "no_nb";
            }

            string frontendLanguage = LanguageHelper.GetFrontendStandardLanguage(languageCode);

            if (string.IsNullOrEmpty(frontendLanguage))
            {
                frontendLanguage = "no_nb";
            }

            HttpContext.Response.Cookies.Append("selectedLanguage", frontendLanguage, new CookieOptions
            {
                // Make this cookie readable by Javascript.
                HttpOnly = false,
            });

            return Task.CompletedTask;
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
