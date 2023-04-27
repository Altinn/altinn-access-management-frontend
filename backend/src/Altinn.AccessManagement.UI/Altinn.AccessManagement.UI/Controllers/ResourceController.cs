using Altinn.AccessManagement.UI.Core.Enums;
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
    /// Controller to update AccessManagement with resources existing i ResourceRegister.
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class ResourceController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly IResourceAdministrationPoint _rap;
        private readonly IProfileService _profileService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceController"/> class.
        /// </summary>
        /// <param name="logger">the logger.</param>
        /// <param name="resourceAdministrationPoint">The resource administration point</param>
        /// <param name="profileService">handler for profile service</param>
        /// <param name="httpContextAccessor">handler for httpcontext</param>
        public ResourceController(
            ILogger<ResourceController> logger,
            IResourceAdministrationPoint resourceAdministrationPoint,
            IProfileService profileService,
            IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _rap = resourceAdministrationPoint;
            _profileService = profileService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Get list of maskinprotenschema resources
        /// </summary>
        /// <returns>List of API service resources</returns>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/resources/maskinportenschema")]
        public async Task<ActionResult<List<ServiceResourceFE>>> Get()
        {
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            UserProfile userProfile = await _profileService.GetUserProfile(userId);
            string languageCode = ProfileHelper.GetLanguageCodeForUser(userProfile);

            return await _rap.GetResources(ResourceType.MaskinportenSchema, languageCode);
        }
    }
}
