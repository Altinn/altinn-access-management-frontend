using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
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
    /// API for the Frontend to fetch an agent request then reject or approve it.
    /// The adminstration ( CRUD API ) of requests are done by Vendors directly towards the Authentication component.
    /// </summary>
    [Route("accessmanagement/api/v1/systemuser/agentrequest")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemUserAgentRequestController(
        ISystemUserAgentRequestService _systemUserAgentRequestService, 
        IOptions<PlatformSettings> _platformSettings, 
        IHttpContextAccessor _httpContextAccessor,
        IOptions<GeneralSettings> _generalSettings) : ControllerBase
    {       
        /// <summary>
        /// Gets an agent request by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{agentRequestId}")]
        public async Task<ActionResult> GetAgentRequestByPartyIdAndRequestId([FromRoute] int partyId, [FromRoute] Guid agentRequestId, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            Result<SystemUserAgentRequestFE> req = await _systemUserAgentRequestService.GetSystemUserAgentRequest(partyId, agentRequestId, languageCode, cancellationToken);
            if (req.IsProblem)
            {
                return req.Problem.ToActionResult();
            }
            
            return Ok(req.Value);
        }

        /// <summary>
        /// Approve a VendorRequest by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{agentRequestId}/approve")]
        public async Task<ActionResult> ApproveSystemUserAgentRequest([FromRoute] int partyId, [FromRoute] Guid agentRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserAgentRequestService.ApproveSystemUserAgentRequest(partyId, agentRequestId, cancellationToken);
            if (req.IsProblem)
            {
                return req.Problem.ToActionResult();
            }

            return Ok(req.Value);
        }

        /// <summary>
        /// Reject a VendorRequest by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{agentRequestId}/reject")]
        public async Task<ActionResult> RejectSystemUserAgentRequest([FromRoute] int partyId, [FromRoute] Guid agentRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserAgentRequestService.RejectSystemUserAgentRequest(partyId, agentRequestId, cancellationToken);
            if (req.IsProblem)
            {
                return req.Problem.ToActionResult();
            }

            return Ok(req.Value);
        }
        
        /// <summary>
        /// Logout
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{agentRequestId}/logout")]
        public IActionResult Logout(Guid agentRequestId)
        {
            CookieOptions cookieOptions = new()
            {
                Domain = _generalSettings.Value.Hostname,
                HttpOnly = true,
                Secure = true,
                IsEssential = true,
                SameSite = SameSiteMode.Lax
            };

            // store cookie value for redirect
            HttpContext.Response.Cookies.Append("AltinnLogoutInfo", $"SystemuserRequestId={agentRequestId}", cookieOptions);
            
            string logoutUrl = $"{_platformSettings.Value.ApiAuthenticationEndpoint}logout";
            return Redirect(logoutUrl);
        }
    }
}