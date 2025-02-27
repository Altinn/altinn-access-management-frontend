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
    /// API for the Frontend to fetch a Request then reject or approve it.
    /// The adminstration ( CRUD API ) of Requests are done by Vendors directly towards the Authentication component.
    /// </summary>
    [Route("accessmanagement/api/v1/systemuser/clientdelegationrequest")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemUserClientDelegationRequestController(
        ISystemUserClientDelegationRequestService _systemUserClientDelegationRequestService, 
        IOptions<PlatformSettings> _platformSettings, 
        IHttpContextAccessor _httpContextAccessor,
        IOptions<GeneralSettings> _generalSettings) : ControllerBase
    {       
        /// <summary>
        /// Gets a VendorRequest by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{clientDelegationRequestId}")]
        public async Task<ActionResult> GetClientDelegationRequestByPartyIdAndRequestId([FromRoute] int partyId, [FromRoute] Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            Result<SystemUserClientDelegationRequestFE> req = await _systemUserClientDelegationRequestService.GetSystemUserClientDelegationRequest(partyId, clientDelegationRequestId, languageCode, cancellationToken);
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
        [HttpPost("{partyId}/{clientDelegationRequestId}/approve")]
        public async Task<ActionResult> ApproveSystemUserClientDelegationRequest([FromRoute] int partyId, [FromRoute] Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserClientDelegationRequestService.ApproveSystemUserClientDelegationRequest(partyId, clientDelegationRequestId, cancellationToken);
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
        [HttpPost("{partyId}/{clientDelegationRequestId}/reject")]
        public async Task<ActionResult> RejectSystemUserClientDelegationRequest([FromRoute] int partyId, [FromRoute] Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserClientDelegationRequestService.RejectSystemUserClientDelegationRequest(partyId, clientDelegationRequestId, cancellationToken);
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
        [HttpGet("{clientDelegationRequestId}/logout")]
        public IActionResult Logout(Guid clientDelegationRequestId)
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
            HttpContext.Response.Cookies.Append("AltinnLogoutInfo", $"SystemuserClientDelegationRequestId={clientDelegationRequestId}", cookieOptions);
            
            string logoutUrl = $"{_platformSettings.Value.ApiAuthenticationEndpoint}logout";
            return Redirect(logoutUrl);
        }
    }
}