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
        /// Gets role connections for the given parties.
        /// </summary>
        /// <param name="party">The party performing the lookup.</param>
        /// <param name="from">Optional right owner to filter on.</param>
        /// <param name="to">Optional right holder to filter on.</param>
        [HttpGet]
        [Authorize]
        [Route("connections")]
        public async Task<ActionResult<List<RolePermission>>> GetConnections([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] Guid? to)
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
                List<RolePermission> connections = await _roleService.GetConnections(party, from, to, languageCode);
                return Ok(connections);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error getting role connections");
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

        /// <summary>
        /// Gets role metadata for the provided role id.
        /// </summary>
        /// <param name="roleId">The role identifier.</param>
        [HttpGet]
        [Authorize]
        [Route("{roleId:guid}")]
        public async Task<ActionResult<RoleMetadata>> GetRoleById([FromRoute] Guid roleId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);

                RoleMetadata role = await _roleService.GetRoleById(roleId, languageCode);
                if (role == null)
                {
                    return NotFound();
                }

                return Ok(role);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error getting role {RoleId}", roleId);
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

        /// <summary>
        /// Gets the packages available for the specified role.
        /// </summary>
        /// <param name="roleId">The role identifier.</param>
        /// <param name="variant">Optional variant filter. Must match the entity type of the party offering the role (e.g., "person", "enterprise", "AS", "NUF", "ENK").</param>
        /// <param name="includeResources">Whether package resources should be included.</param>
        /// <remarks>
        /// The variant parameter should correspond to the entity type of the party offering the role.
        /// Common values include: "person" for individuals, or organization types like "AS", "NUF", "ENK", etc.
        /// </remarks>
        [HttpGet]
        [Authorize]
        [Route("{roleId:guid}/packages")]
        public async Task<ActionResult<IEnumerable<AccessPackage>>> GetRolePackages(
            [FromRoute] Guid roleId,
            [FromQuery] string variant = null,
            [FromQuery] bool includeResources = false)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
                IEnumerable<AccessPackage> packages = await _roleService.GetRolePackages(roleId, variant, includeResources, languageCode);
                return Ok(packages);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error getting packages for role {RoleId}", roleId);
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }

        /// <summary>
        /// Gets the resources available for the specified role.
        /// </summary>
        /// <param name="roleId">The role identifier.</param>
        /// <param name="variant">Optional variant filter. Must match the entity type of the party offering the role (e.g., "person", "enterprise", "AS", "NUF", "ENK").</param>
        /// <param name="includePackageResources">Whether to include resources inherited from packages.</param>
        /// <remarks>
        /// The variant parameter should correspond to the entity type of the party offering the role.
        /// Common values include: "person" for individuals, or organization types like "AS", "NUF", "ENK", etc.
        /// </remarks>
        [HttpGet]
        [Authorize]
        [Route("{roleId:guid}/resources")]
        public async Task<ActionResult<IEnumerable<ResourceAM>>> GetRoleResources(
            [FromRoute] Guid roleId,
            [FromQuery] string variant = null,
            [FromQuery(Name = "includePackageResources")] bool includePackageResources = false)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
                IEnumerable<ResourceAM> resources = await _roleService.GetRoleResources(roleId, variant, includePackageResources, languageCode);
                return Ok(resources);
            }
            catch (HttpStatusException ex)
            {
                _logger.LogError(ex, "Error getting resources for role {RoleId}", roleId);
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }
    }
}
