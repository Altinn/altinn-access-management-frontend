using System.ComponentModel;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Role;
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
        ///     Get roles for user
        /// </summary>
        /// <returns>All search results</returns>
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
    }
}
