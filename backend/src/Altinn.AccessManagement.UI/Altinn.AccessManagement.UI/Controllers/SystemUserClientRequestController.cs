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
    [Route("accessmanagement/api/v1/systemuser/ClientRequest")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemUserClientRequestController(
        ISystemUserClientRequestService _systemUserClientRequestService, 
        IOptions<PlatformSettings> _platformSettings, 
        IHttpContextAccessor _httpContextAccessor,
        IOptions<GeneralSettings> _generalSettings) : ControllerBase
    {       
        /// <summary>
        /// Gets a VendorRequest by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{ClientRequestId}")]
        public async Task<ActionResult> GetClientRequestByPartyIdAndRequestId([FromRoute] int partyId, [FromRoute] Guid ClientRequestId, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            Result<SystemUserClientRequestFE> req = await _systemUserClientRequestService.GetSystemUserClientRequest(partyId, ClientRequestId, languageCode, cancellationToken);
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
        [HttpPost("{partyId}/{ClientRequestId}/approve")]
        public async Task<ActionResult> ApproveSystemUserClientRequest([FromRoute] int partyId, [FromRoute] Guid ClientRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserClientRequestService.ApproveSystemUserClientRequest(partyId, ClientRequestId, cancellationToken);
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
        [HttpPost("{partyId}/{ClientRequestId}/reject")]
        public async Task<ActionResult> RejectSystemUserClientRequest([FromRoute] int partyId, [FromRoute] Guid ClientRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserClientRequestService.RejectSystemUserClientRequest(partyId, ClientRequestId, cancellationToken);
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
        [HttpGet("{ClientRequestId}/logout")]
        public IActionResult Logout(Guid ClientRequestId)
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
            HttpContext.Response.Cookies.Append("AltinnLogoutInfo", $"SystemuserClientRequestId={ClientRequestId}", cookieOptions);
            
            string logoutUrl = $"{_platformSettings.Value.ApiAuthenticationEndpoint}logout";
            return Redirect(logoutUrl);
        }
    }
}