using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Endpoint for changing the active reportee context (sets <c>AltinnPartyId</c> / <c>AltinnPartyUuid</c>
    /// cookies) and redirecting back to a caller-supplied URL. Replaces the legacy Altinn 2
    /// <c>/ui/Reportee/ChangeReporteeAndRedirect</c>.
    /// </summary>
    [Route("accessmanagement/api/v1/reportee")]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class ReporteeController : Controller
    {
        private const string ErrorPagePath = "/accessmanagement/ui/errorpage/reportee";

        private readonly IUserService _userService;
        private readonly GeneralSettings _generalSettings;
        private readonly FeatureFlags _featureFlags;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ReporteeController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReporteeController"/> class.
        /// </summary>
        public ReporteeController(
            IUserService userService,
            IOptions<GeneralSettings> generalSettings,
            IOptions<FeatureFlags> featureFlags,
            IWebHostEnvironment env,
            ILogger<ReporteeController> logger)
        {
            _userService = userService;
            _generalSettings = generalSettings.Value;
            _featureFlags = featureFlags.Value;
            _env = env;
            _logger = logger;
        }

        /// <summary>
        /// Sets the reportee cookies for the supplied party (after verifying it is on the user's
        /// reportee list) and redirects to <paramref name="goTo"/> if it is allowed, otherwise
        /// to the configured frontend base URL.
        /// </summary>
        /// <param name="partyUuid">PartyUuid of the desired reportee.</param>
        /// <param name="p">Legacy alias for <paramref name="partyUuid"/> (kept for backwards compatibility with Altinn 2 callers).</param>
        /// <param name="partyId">Numeric PartyId of the desired reportee. Used when <paramref name="partyUuid"/> is not provided.</param>
        /// <param name="goTo">Absolute URL to redirect to after setting cookies. Must point to an allow-listed domain.</param>
        [HttpGet("changeandredirect")]
        [IgnoreAntiforgeryToken]
        [Authorize]
        public async Task<IActionResult> ChangeAndRedirect(
            [FromQuery(Name = "partyUuid")] Guid? partyUuid,
            [FromQuery(Name = "P")] Guid? p,
            [FromQuery(Name = "partyId")] int? partyId,
            [FromQuery(Name = "goTo")] string goTo)
        {
            Guid? targetUuid = partyUuid ?? p;
            string fallbackUrl = _generalSettings.FrontendBaseUrl ?? string.Empty;
            string redirectTarget = TryGetSafeRedirectUrl(goTo, out string safeUrl) ? safeUrl : fallbackUrl;

            try
            {
                AuthorizedParty party = await ResolveAuthorizedParty(targetUuid, partyId);

                if (party == null)
                {
                    _logger.LogInformation("ChangeAndRedirect: party not found in reportee list. partyUuid={PartyUuid} partyId={PartyId}", targetUuid, partyId);
                    return Redirect(ErrorPagePath);
                }

                PartyCookieHelper.WritePartyCookies(Response, party.PartyId, party.PartyUuid, _generalSettings?.Hostname, !_env.IsDevelopment());

                if (TryBuildAltinn2BounceUrl(party.PartyUuid, redirectTarget, out string bounceUrl))
                {
                    _logger.LogInformation("ChangeAndRedirect: bouncing via Altinn 2 to set legacy cookies. partyUuid={PartyUuid}", party.PartyUuid);
                    return Redirect(bounceUrl);
                }

                return Redirect(redirectTarget);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ChangeAndRedirect failed");
                return Redirect(ErrorPagePath);
            }
        }

        /// <summary>
        /// In-app variant of <see cref="ChangeAndRedirect"/> intended for same-origin XHR/fetch from the SPA.
        /// Sets the reportee cookies and returns a status code instead of redirecting.
        /// </summary>
        /// <param name="partyUuid">PartyUuid of the desired reportee.</param>
        /// <param name="partyId">Numeric PartyId of the desired reportee. Used when <paramref name="partyUuid"/> is not provided.</param>
        /// <returns>200 OK on success, 400 Bad Request if no party is supplied, 403 Forbidden if the party is not on the user's reportee list.</returns>
        [HttpPost("change")]
        [Authorize]
        public async Task<IActionResult> Change(
            [FromQuery(Name = "partyUuid")] Guid? partyUuid,
            [FromQuery(Name = "partyId")] int? partyId)
        {
            bool hasUuid = partyUuid.HasValue && partyUuid.Value != Guid.Empty;
            bool hasId = partyId.HasValue && partyId.Value > 0;
            if (!hasUuid && !hasId)
            {
                return BadRequest();
            }

            AuthorizedParty party;
            try
            {
                party = await ResolveAuthorizedParty(partyUuid, partyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Change failed");
                return StatusCode(500);
            }

            if (party == null)
            {
                return StatusCode(403);
            }

            PartyCookieHelper.WritePartyCookies(Response, party.PartyId, party.PartyUuid, _generalSettings?.Hostname, !_env.IsDevelopment());
            return Ok();
        }

        private async Task<AuthorizedParty> ResolveAuthorizedParty(Guid? partyUuid, int? partyId)
        {
            if (partyUuid.HasValue && partyUuid.Value != Guid.Empty)
            {
                List<AuthorizedParty> reporteeList = await _userService.GetReporteeListForUser();
                return reporteeList?.FirstOrDefault(party => party.PartyUuid == partyUuid.Value);
            }

            if (partyId.HasValue && partyId.Value > 0)
            {
                return await _userService.GetPartyFromReporteeListIfExists(partyId.Value);
            }

            return null;
        }

        private bool TryBuildAltinn2BounceUrl(Guid partyUuid, string finalGoTo, out string bounceUrl)
        {
            bounceUrl = null;

            if (!_featureFlags.RouteChangeReporteeViaAltinn2)
            {
                return false;
            }

            string hostname = _generalSettings?.Hostname;
            if (string.IsNullOrWhiteSpace(hostname) || !hostname.Contains("altinn", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("RouteChangeReporteeViaAltinn2 is enabled but Hostname '{Hostname}' is not a valid Altinn host; skipping bounce.", hostname);
                return false;
            }

            string altinn2ChangeUrl = $"https://{hostname}/ui/Reportee/ChangeReporteeAndRedirect/";
            Dictionary<string, string> queryParams = new()
            {
                ["P"] = partyUuid.ToString(),
            };

            if (!string.IsNullOrWhiteSpace(finalGoTo))
            {
                queryParams["goTo"] = finalGoTo;
            }

            bounceUrl = QueryHelpers.AddQueryString(altinn2ChangeUrl, queryParams);
            return true;
        }

        private bool TryGetSafeRedirectUrl(string url, out string safeUrl)
        {
            safeUrl = null;

            if (string.IsNullOrWhiteSpace(url))
            {
                return false;
            }

            if (!Uri.TryCreate(url, UriKind.Absolute, out Uri parsed))
            {
                return false;
            }

            if (parsed.Scheme != Uri.UriSchemeHttp && parsed.Scheme != Uri.UriSchemeHttps)
            {
                return false;
            }

            List<string> allowed = _generalSettings?.AllowedRedirectDomains;
            if (allowed == null || allowed.Count == 0)
            {
                return false;
            }

            string host = parsed.Host;
            foreach (string domain in allowed)
            {
                if (string.IsNullOrWhiteSpace(domain))
                {
                    continue;
                }

                if (host.Equals(domain, StringComparison.OrdinalIgnoreCase) ||
                    host.EndsWith("." + domain, StringComparison.OrdinalIgnoreCase))
                {
                    safeUrl = parsed.AbsoluteUri;
                    return true;
                }
            }

            return false;
        }
    }
}
