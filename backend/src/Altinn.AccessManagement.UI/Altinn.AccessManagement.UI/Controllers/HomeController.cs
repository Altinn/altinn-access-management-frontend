using System.Web;
using Altinn.AccessManagement.Models;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
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
        private readonly IUserService _userService;

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
        /// <param name="userService">user service to look up things about the user</param>
        public HomeController(
            IOptions<FrontEndEntryPointOptions> frontEndEntrypoints,
            IAntiforgery antiforgery,
            IOptions<PlatformSettings> platformSettings,
            IWebHostEnvironment env,
            IHttpContextAccessor httpContextAccessor,
            IOptions<GeneralSettings> generalSettings,
            IOptions<FeatureFlags> featureFlags,
            IUserService userService)
        {
            _antiforgery = antiforgery;
            _platformSettings = platformSettings.Value;
            _env = env;
            _httpContextAccessor = httpContextAccessor;
            _generalSettings = generalSettings.Value;
            _featureFlags = featureFlags.Value;
            _userService = userService;
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

            string queryString = Request.QueryString.HasValue ? $"{Request.QueryString.Value}&openAccountMenu=true" : "?openAccountMenu=true";
            string goToUrl = HttpUtility.UrlEncode($"{_generalSettings.FrontendBaseUrl}{Request.Path}{queryString}");
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

        private async Task CheckAndSetPartyRepresentationCookies()
        {
            var httpContext = _httpContextAccessor.HttpContext;

            string partyUuid = httpContext?.Request.Cookies["AltinnPartyUuid"];
            string partyId = httpContext?.Request.Cookies["AltinnPartyId"];

            if (string.IsNullOrEmpty(partyId))
            {
                // PartyIdCookie is missing -> set it to match partyUuid if available or default to current user
                string setPartyId;

                if (!string.IsNullOrEmpty(partyUuid) && Guid.TryParse(partyUuid, out Guid partyGuid))
                {
                    var actorList = await _userService.GetReporteeListForUser();
                    var reporteeParty = actorList.FirstOrDefault(party => party.PartyUuid == partyGuid);
                    setPartyId = reporteeParty?.PartyId > 0 ? reporteeParty.PartyId.ToString() : AuthenticationHelper.GetUserPartyId(httpContext);
                }
                else
                {
                    setPartyId = AuthenticationHelper.GetUserPartyId(httpContext);
                }

                CookieOptions cookieOptions = new CookieOptions
                {
                    // Make this cookie readable by Javascript.
                    HttpOnly = false,
                    Secure = false,
                    Path = "/",
                    SameSite = SameSiteMode.Lax
                };

                // Set domain only if we have a hostname configured
                if (!string.IsNullOrWhiteSpace(_generalSettings?.Hostname))
                {
                    cookieOptions.Domain = _generalSettings.Hostname;
                }

                HttpContext.Response.Cookies.Append("AltinnPartyId", setPartyId.ToString(), cookieOptions);
            }

            if (string.IsNullOrEmpty(partyUuid))
            {
                // PartyUuidCookie is missing -> set it to match partyId if available or default to current user
                Guid setPartyUuid;

                if (!string.IsNullOrEmpty(partyId) && int.TryParse(partyId, out int partyIdInt))
                {
                    var reporteeParty = await _userService.GetPartyFromReporteeListIfExists(partyIdInt);
                    setPartyUuid = reporteeParty?.PartyUuid ?? AuthenticationHelper.GetUserPartyUuid(httpContext);
                }
                else
                {
                    setPartyUuid = AuthenticationHelper.GetUserPartyUuid(httpContext);
                }

                CookieOptions cookieOptions = new CookieOptions
                {
                    // Make this cookie readable by Javascript.
                    HttpOnly = false,
                    Secure = false,
                    Path = "/",
                    SameSite = SameSiteMode.Lax
                };

                // Set domain only if we have a hostname configured
                if (!string.IsNullOrWhiteSpace(_generalSettings?.Hostname))
                {
                    cookieOptions.Domain = _generalSettings.Hostname;
                }

                HttpContext.Response.Cookies.Append("AltinnPartyUuid", setPartyUuid.ToString(), cookieOptions);
            }

            return;
        }

        private async Task<bool> ShouldShowAppView()
        {
            if (User.Identity.IsAuthenticated)
            {
                await SetLanguageCookie();
                await CheckAndSetPartyRepresentationCookies();
                return true;
            }

            return false;
        }
    }
}
