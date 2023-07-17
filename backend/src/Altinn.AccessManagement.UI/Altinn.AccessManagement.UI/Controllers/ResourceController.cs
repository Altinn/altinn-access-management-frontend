﻿using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller for resources existing i ResourceRegister.
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/resources")]
    public class ResourceController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly IProfileService _profileService;
        private readonly IResourceService _resourceService;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceController" /> class.
        /// </summary>
        /// <param name="logger">the logger.</param>
        /// <param name="resourceService">The resource administration point</param>
        /// <param name="profileService">handler for profile service</param>
        /// <param name="httpContextAccessor">handler for httpcontext</param>
        public ResourceController(
            ILogger<ResourceController> logger,
            IResourceService resourceService,
            IProfileService profileService,
            IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _resourceService = resourceService;
            _profileService = profileService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        ///     Get list of maskinprotenschema resources
        /// </summary>
        /// <returns>List of API service resources</returns>
        [HttpGet]
        [Authorize]
        [Route("maskinportenschema")]
        public async Task<ActionResult<List<ServiceResourceFE>>> Get()
        {
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            UserProfile userProfile = await _profileService.GetUserProfile(userId);
            string languageCode = ProfileHelper.GetLanguageCodeForUser(userProfile);

            return await _resourceService.GetResources(ResourceType.MaskinportenSchema, languageCode);
        }

        /// <summary>
        ///     Gets list of all resource owners
        /// </summary>
        /// <returns>List of resource owners in string format</returns>
        [HttpGet]
        [Authorize]
        [Route("resourceowners")]
        public async Task<ActionResult<List<ResourceOwnerFE>>> GetAllResourceOwners()
        {
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            UserProfile user = await _profileService.GetUserProfile(userId);
            string languageCode = ProfileHelper.GetLanguageCodeForUser(user);

            return await _resourceService.GetAllResourceOwners(languageCode);
        }
    }
}
