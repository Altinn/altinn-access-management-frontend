using System.ComponentModel;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.Role.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="RoleController"/> provides the API endpoints related to roles.
    /// </summary>
    [Route("accessmanagement/api/v1/role")]
    public class RoleController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly IRoleService _roleService;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleController"/> class
        /// </summary>
        public RoleController(IHttpContextAccessor httpContextAccessor, ILogger<RoleController> logger, IRoleService roleService)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _roleService = roleService;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
        }

        /// <summary>
        ///     Search through all roles and return matches
        /// </summary>
        /// <returns>All search results, sorted into areas</returns>
        [HttpGet]
        [Authorize]
        [Route("search")]
        public async Task<ActionResult<List<RoleAreaFE>>> Search([FromQuery] string searchString)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
            {
                return await _roleService.GetSearch(languageCode, searchString);
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.NoContent)
                {
                    return NoContent();
                }

                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
        }

        /// <summary>
        ///     Search through all roles and return matches
        /// </summary>
        /// <returns>All search results, sorted into areas</returns>
        [HttpGet]
        [Authorize]
        [Route("delegationcheck/{rightOwner}/{roleId}")]
        public async Task<ActionResult<DelegationCheckResponse>> RoleDelegationCheck([FromRoute] Guid rightOwner, [FromRoute]Guid roleId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
            {
                return await _roleService.RoleDelegationCheck(rightOwner, roleId);
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.NoContent)
                {
                    return NoContent();
                }

                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
        }

        /// <summary>
        ///     Get roles for user
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize]
        [Route("assignments/{rightOwnerUuid}/{rightHolderUuid}")]
        public async Task<ActionResult<List<RoleAssignment>>> GetRolesForUser(Guid rightOwnerUuid, Guid rightHolderUuid)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(httpContext);
                return await _roleService.GetRolesForUser(languageCode, rightOwnerUuid, rightHolderUuid);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error getting roles");
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

        /// <summary>
        /// Delegate role to user
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Authorize]
        [Route("delegate/{from}/{to}/{roleId}")]
        public async Task<ActionResult> DelegateRoleToUser([FromRoute] Guid from, [FromRoute] Guid to, [FromRoute] Guid roleId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = await _roleService.CreateRoleDelegation(from, to, roleId);
                return StatusCode((int)response.StatusCode, response.Content);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error delegating role");
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

        /// <summary>
        /// Revoke role for user
        /// </summary>
        /// <returns></returns>
        [HttpDelete]
        [Authorize]
        [Route("assignments/{assignmentId}")]
        public async Task<ActionResult> RevokeRoleForUser([FromRoute] Guid assignmentId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = await _roleService.DeleteRoleDelegation(assignmentId);
                return StatusCode((int)response.StatusCode, response.Content);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error deleting assignment");
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

    }
}
