﻿using System.Collections.Generic;
using System.Net;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

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
        private readonly FeatureFlags _featureFlags;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleController"/> class
        /// </summary>
        public RoleController(
            IHttpContextAccessor httpContextAccessor,
            ILogger<RoleController> logger,
            IRoleService roleService,
            IOptions<FeatureFlags> featureFlags)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _roleService = roleService;
            _featureFlags = featureFlags.Value;
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
        /// Revokes a role connection for a right holder.
        /// </summary>
        /// <param name="from">The right owner that delegated the role.</param>
        /// <param name="to">The right holder that received the role.</param>
        /// <param name="party">The party performing the action.</param>
        /// <param name="roleId">The role identifier.</param>
        [HttpDelete]
        [Authorize]
        [Route("connections")]
        public async Task<ActionResult> RevokeRole([FromQuery] Guid from, [FromQuery] Guid to, [FromQuery] Guid party, [FromQuery] Guid roleId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (party != to && party != from)
            {
                return BadRequest("Party must match either 'from' or 'to'.");
            }

            if (roleId == Guid.Empty)
            {
                return BadRequest("roleId is required");
            }

            try
            {
                await _roleService.RevokeRole(from, to, party, roleId);
                return NoContent();
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.NoContent)
                {
                    return NoContent();
                }

                _logger.LogError(ex, "Error revoking role");
                return StatusCode((int)ex.StatusCode, ex.Message);
            }
        }
    }
}
