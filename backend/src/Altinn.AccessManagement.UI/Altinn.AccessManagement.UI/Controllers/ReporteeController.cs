using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Endpoint for changing the active reportee context (sets <c>AltinnPartyId</c> / <c>AltinnPartyUuid</c>
    /// cookies) and redirecting back to a caller-supplied URL. Replaces the legacy Altinn 2
    /// <c>/ui/Reportee/ChangeReporteeAndRedirect</c>.
    /// </summary>
    [Route("accessmanagement/api/v1/reportee")]
    public class ReporteeController : Controller
    {
        private const string ErrorPagePath = "/accessmanagement/ui/errorpage/reportee";

        private readonly IUserService _userService;
        private readonly GeneralSettings _generalSettings;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ReporteeController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReporteeController"/> class.
        /// </summary>
        public ReporteeController(
            IUserService userService,
            IOptions<GeneralSettings> generalSettings,
            IWebHostEnvironment env,
            ILogger<ReporteeController> logger)
        {
            _userService = userService;
            _generalSettings = generalSettings.Value;
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
        [HttpPost("changeandredirect")]
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
            string redirectTarget = IsAllowedRedirectUrl(goTo) ? goTo : fallbackUrl;

            try
            {
                AuthorizedParty party = await ResolveAuthorizedParty(targetUuid, partyId);

                if (party == null)
                {
                    _logger.LogInformation("ChangeAndRedirect: party not found in reportee list. partyUuid={PartyUuid} partyId={PartyId}", targetUuid, partyId);
                    return Redirect(ErrorPagePath);
                }

                PartyCookieHelper.WritePartyCookies(Response, party.PartyId, party.PartyUuid, _generalSettings?.Hostname, !_env.IsDevelopment());

                return Redirect(redirectTarget);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ChangeAndRedirect failed");
                return Redirect(ErrorPagePath);
            }
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

        private bool IsAllowedRedirectUrl(string url)
        {
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
                    return true;
                }
            }

            return false;
        }
    }
}
