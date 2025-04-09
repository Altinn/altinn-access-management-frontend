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
    /// API for the Frontend to fetch a change request then reject or approve it.
    /// The adminstration ( CRUD API ) of change requests are done by Vendors directly towards the Authentication component.
    /// </summary>
    [Route("accessmanagement/api/v1/systemuser/changerequest")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemUserChangeRequestController(
        ISystemUserChangeRequestService _systemUserChangeRequestService, 
        IOptions<PlatformSettings> _platformSettings, 
        IHttpContextAccessor _httpContextAccessor,
        IOptions<GeneralSettings> _generalSettings) : ControllerBase
    {       
        /// <summary>
        /// Gets a SystemUserChangeRequestFE by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{changeRequestId}")]
        public async Task<ActionResult> GetChangeRequestByPartyIdAndRequestId([FromRoute] Guid partyId, [FromRoute] Guid changeRequestId, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            Result<SystemUserChangeRequestFE> req = await _systemUserChangeRequestService.GetSystemUserChangeRequest(partyId, changeRequestId, languageCode, cancellationToken);
            if (req.IsProblem)
            {
                return req.Problem.ToActionResult();
            }
            
            return Ok(req.Value);
        }

        /// <summary>
        /// Approve a SystemUserChangeRequestFE by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{changeRequestId}/approve")]
        public async Task<ActionResult> ApproveSystemUserChangeRequest([FromRoute] Guid partyId, [FromRoute] Guid changeRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserChangeRequestService.ApproveSystemUserChangeRequest(partyId, changeRequestId, cancellationToken);
            if (req.IsProblem)
            {
                return req.Problem.ToActionResult();
            }

            return Ok(req.Value);
        }

        /// <summary>
        /// Reject a SystemUserChangeRequestFE by Id
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{changeRequestId}/reject")]
        public async Task<ActionResult> RejectSystemUserChangeRequest([FromRoute] Guid partyId, [FromRoute] Guid changeRequestId, CancellationToken cancellationToken)
        {
            Result<bool> req = await _systemUserChangeRequestService.RejectSystemUserChangeRequest(partyId, changeRequestId, cancellationToken);
            if (req.IsProblem)
            {
                return req.Problem.ToActionResult();
            }

            return Ok(req.Value);
        }
        
        /// <summary>
        /// Logout and store change request id in cookie
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{changeRequestId}/logout")]
        public IActionResult Logout(Guid changeRequestId)
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
            HttpContext.Response.Cookies.Append("AltinnLogoutInfo", $"SystemuserChangeRequestId={changeRequestId}", cookieOptions);
            
            string logoutUrl = $"{_platformSettings.Value.ApiAuthenticationEndpoint}logout";
            return Redirect(logoutUrl);
        }
    }
}