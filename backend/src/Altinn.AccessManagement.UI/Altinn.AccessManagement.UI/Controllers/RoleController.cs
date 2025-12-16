using System.Collections.Generic;
using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

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
        private readonly IRoleService _roleService;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleController"/> class
        /// </summary>
        public RoleController(
            IHttpContextAccessor httpContextAccessor,
            ILogger<RoleController> logger,
            IRoleService roleService)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _roleService = roleService;
        }

        /// <summary>
        /// Gets permissions for the given parties.
        /// </summary>
        /// <param name="party">The party performing the lookup.</param>
        /// <param name="from">Optional right owner to filter on.</param>
        /// <param name="to">Optional right holder to filter on.</param>
        [HttpGet]
        [Authorize]
        [Route("permissions")]
        public async Task<ActionResult<List<RolePermission>>> GetRolePermissions([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] Guid? to)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!from.HasValue && !to.HasValue)
            {
                return BadRequest("Either 'from' or 'to' query parameter must be provided.");
            }

            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
                List<RolePermission> permissions = await _roleService.GetRolePermissions(party, from, to, languageCode);
                return Ok(permissions);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error getting role permissions");
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

        /// <summary>
        /// Gets metadata for all roles.
        /// </summary>
        [HttpGet("meta")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RoleMetadata>>> GetAllRoles()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
                IEnumerable<RoleMetadata> roles = await _roleService.GetAllRoles(languageCode);
                return Ok(roles);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error getting all roles");
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

        /// <summary>
        /// Gets the packages available for the specified role.
        /// </summary>
        /// <param name="roleCode">The role code.</param>
        /// <param name="variant">Optional variant filter. Must match the entity type of the party offering the role (e.g., "person", "enterprise", "AS", "NUF", "ENK").</param>
        /// <param name="includeResources">Whether package resources should be included.</param>
        /// <remarks>
        /// The variant parameter should correspond to the entity type of the party offering the role.
        /// Common values include: "person" for individuals, or organization types like "AS", "NUF", "ENK", etc.
        /// </remarks>
        [HttpGet("packages")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AccessPackage>>> GetRolePackages(
            [FromQuery(Name = "roleCode")] string roleCode,
            [FromQuery] string variant = null,
            [FromQuery] bool includeResources = false)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(roleCode) || string.IsNullOrWhiteSpace(variant))
            {
                return BadRequest("roleCode and variant query parameters must be provided.");
            }

            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
                IEnumerable<AccessPackage> packages = await _roleService.GetRolePackages(roleCode, variant, includeResources, languageCode);
                return Ok(packages);
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response"));
            }
        }

        /// <summary>
        /// Gets the resources available for the specified role.
        /// </summary>
        /// <param name="roleCode">The role code.</param>
        /// <param name="variant">Optional variant filter. Must match the entity type of the party offering the role (e.g., "person", "enterprise", "AS", "NUF", "ENK").</param>
        /// <param name="includePackageResources">Whether to include resources inherited from packages.</param>
        /// <remarks>
        /// The variant parameter should correspond to the entity type of the party offering the role.
        /// Common values include: "person" for individuals, or organization types like "AS", "NUF", "ENK", etc.
        /// </remarks>
        [HttpGet("resources")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ResourceAM>>> GetRoleResources(
            [FromQuery(Name = "roleCode")] string roleCode,
            [FromQuery] string variant = null,
            [FromQuery(Name = "includePackageResources")] bool includePackageResources = false)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(roleCode) || string.IsNullOrWhiteSpace(variant))
            {
                return BadRequest("roleCode and variant query parameters must be provided.");
            }

            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
                IEnumerable<ResourceAM> resources = await _roleService.GetRoleResources(roleCode, variant, includePackageResources, languageCode);
                return Ok(resources);
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response"));
            }
        }
    }
}
