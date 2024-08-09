using System.Net;
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
    ///     Controller for CRUD-operations related to the ResourceRegister.
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/resources")]
    public class ResourceController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly IUserService _userService;
        private readonly IResourceService _resourceService;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ResourceController" /> class.
        /// </summary>
        /// <param name="logger">the logger.</param>
        /// <param name="resourceService">The resource administration point</param>
        /// <param name="userService">handler for profile service</param>
        /// <param name="httpContextAccessor">handler for httpcontext</param>
        public ResourceController(
            ILogger<ResourceController> logger,
            IResourceService resourceService,
            IUserService userService,
            IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _resourceService = resourceService;
            _userService = userService;
            _httpContextAccessor = httpContextAccessor;
        }


        /// <summary>
        ///     Gets list of resource owners that has the resourceTypesProvided by <param name="relevantResourceTypes"></param>
        /// </summary>
        /// <returns>List of resource owners in string format</returns>
        [HttpGet]
        [Authorize]
        [Route("resourceowners")]
        public async Task<ActionResult<List<ResourceOwnerFE>>> GetResourceOwners([FromQuery] List<ResourceType> relevantResourceTypes)
        {
            var languageCode = ProfileHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            if (relevantResourceTypes?.Count > 0)
            {
                return await _resourceService.GetResourceOwners(relevantResourceTypes, languageCode);
            }
            else
            {
                return await _resourceService.GetAllResourceOwners(languageCode);
            }
        }

        /// <summary>
        ///     Search through all delegable service resources and returns matches
        /// </summary>
        /// <returns>Paginated search results</returns>
        [HttpGet]
        [Authorize]
        [Route("search")]
        public async Task<ActionResult<PaginatedList<ServiceResourceFE>>> PaginatedSearch([FromQuery] PaginatedSearchParams parameters)
        {
            var languageCode = ProfileHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
            {
                return await _resourceService.GetPaginatedSearchResults(languageCode, parameters.ROFilters, parameters.SearchString, parameters.Page, parameters.ResultsPerPage);
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
        ///     Searches through all delegable maskinportenschema services and returns matches based on the provided search string and filters
        /// </summary>
        /// <returns>list of maskinportenschemas matching search params</returns>
        [HttpGet]
        [Authorize]
        [Route("maskinportenapi/search")]
        public async Task<ActionResult<List<ServiceResourceFE>>> MaskinportenSearch([FromQuery] ApiSearchParams parameters)
        {
            var languageCode = ProfileHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
            {
                return await _resourceService.MaskinportenschemaSearch(languageCode, parameters.ROFilters, parameters.SearchString);
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
    }
}
