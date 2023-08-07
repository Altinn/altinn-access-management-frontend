using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller to update AccessManagement with resources existing i ResourceRegister.
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/resources")]
    public class ResourceController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly IProfileService _profileService;
        private readonly IResourceAdministrationPoint _rap;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceController" /> class.
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
        ///     Get list of maskinportenschema resources
        /// </summary>
        /// <returns>List of API service resources</returns>
        [HttpGet]
        [Authorize]
        [Route("maskinportenschema")]
        public async Task<ActionResult<List<ServiceResourceFE>>> GetMaskinportenSchema()
        {
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            UserProfile userProfile = await _profileService.GetUserProfile(userId);
            string languageCode = ProfileHelper.GetLanguageCodeForUser(userProfile);

            return await _rap.GetResources(ResourceType.MaskinportenSchema, languageCode);
        }

        /// <summary>
        /// Search through all delegable service resources and returns matches
        /// </summary>
        /// <returns>Paginated search results</returns>
        [HttpGet]
        [Authorize]
        [Route("paginatedSearch")]
        public async Task<ActionResult<PaginatedList<ServiceResourceFE>>> PaginatedSearch([FromQuery] PaginatedSearchParams parameters)
        {
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            UserProfile userProfile = await _profileService.GetUserProfile(userId);
            string languageCode = ProfileHelper.GetLanguageCodeForUser(userProfile);

            try
            {
                return await _rap.GetPaginatedSearchResults(languageCode, parameters.ROFilters, parameters.SearchString, parameters.Page, parameters.ResultsPerPage);
            }
            catch (HttpStatusException ex)
            {
                if (ex.Status == System.Net.HttpStatusCode.NoContent)
                {
                    return NoContent();
                }
                else
                {
                    string responseContent = ex.Message;
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.Status, "Unexpected HttpStatus response", detail: responseContent));
                }
            }
        }
    }
}
