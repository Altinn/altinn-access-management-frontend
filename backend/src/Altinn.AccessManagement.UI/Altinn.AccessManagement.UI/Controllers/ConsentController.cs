using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// API for Consent Integrations, both request and history
    /// </summary>
    [Route("accessmanagement/api/v1/consent")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class ConsentController : ControllerBase
    {
        private readonly IConsentService _consentService;
        private readonly IOptions<PlatformSettings> _platformSettings;
        private readonly IOptions<GeneralSettings> _generalSettings;
        private readonly EncryptionService _encryptionService;

        /// <summary>
        /// Constructor for <see cref="ConsentController"/>
        /// </summary>
        public ConsentController(
            IConsentService consentService,        
            IOptions<PlatformSettings> platformSettings, 
            IOptions<GeneralSettings> generalSettings,
            EncryptionService encryptionService)
        {
            _consentService = consentService;
            _platformSettings = platformSettings;
            _generalSettings = generalSettings;
            _encryptionService = encryptionService;
        }
        
        /// <summary>
        /// Get a consent request by id
        /// </summary>
        /// <param name="consentRequestId">Consent request to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("request/{consentRequestId}")]
        public async Task<ActionResult> GetConsentRequest([FromRoute] Guid consentRequestId, CancellationToken cancellationToken)
        {
            Result<ConsentRequestFE> consentRequest = await _consentService.GetConsentRequest(consentRequestId, cancellationToken);

            if (consentRequest.IsProblem)
            {
                return consentRequest.Problem.ToActionResult();
            }

            return Ok(consentRequest.Value);
        }

        /// <summary>
        /// Approve consent request
        /// </summary>
        /// <param name="consentRequestId">Consent request to approve</param>
        /// <param name="context">Context when approving</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("request/{consentRequestId}/approve")]
        public async Task<ActionResult> ApproveConsent([FromRoute] Guid consentRequestId, ApproveConsentContext context, CancellationToken cancellationToken)
        {
            Result<bool> approveResponse = await _consentService.ApproveConsentRequest(consentRequestId, context, cancellationToken);

            if (approveResponse.IsProblem)
            {
                return approveResponse.Problem.ToActionResult();
            }

            return Ok(approveResponse.Value);
        }

        /// <summary>
        /// Reject consent request
        /// </summary>
        /// <param name="consentRequestId">Consent request to reject</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("request/{consentRequestId}/reject")]
        public async Task<ActionResult> RejectConsent([FromRoute] Guid consentRequestId, CancellationToken cancellationToken)
        {
            Result<bool> rejectResponse = await _consentService.RejectConsentRequest(consentRequestId, cancellationToken);

            if (rejectResponse.IsProblem)
            {
                return rejectResponse.Problem.ToActionResult();
            }

            return Ok(rejectResponse.Value);
        }

        /// <summary>
        /// Logout after user acccepts or rejects consent
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("request/{consentRequestId}/logout")]
        public async Task<IActionResult> Logout(Guid consentRequestId, CancellationToken cancellationToken)
        {
            CookieOptions cookieOptions = new()
            {
                Domain = _generalSettings.Value.Hostname,
                HttpOnly = true,
                Secure = true,
                IsEssential = true,
                SameSite = SameSiteMode.Lax
            };

            Result<string> redirectUrlResponse = await _consentService.GetConsentRequestRedirectUrl(consentRequestId, cancellationToken);

            if (redirectUrlResponse.IsSuccess)
            {
                // store encrypted redirect url in cookie
                string encryptedUrl = await _encryptionService.EncryptText(redirectUrlResponse.Value);
                HttpContext.Response.Cookies.Append("AltinnLogoutInfo", $"amSafeRedirectUrl={encryptedUrl}", cookieOptions);
            }
            
            string logoutUrl = $"{_platformSettings.Value.ApiAuthenticationEndpoint}logout";
            return Redirect(logoutUrl);
        }
    }
}