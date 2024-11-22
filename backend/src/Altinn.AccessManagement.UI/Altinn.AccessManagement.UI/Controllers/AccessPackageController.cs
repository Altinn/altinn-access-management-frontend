using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="AccessPackageController"/> provides the API endpoints related to access packages.
    /// </summary>
    [Route("accessmanagement/api/v1/accesspackage")]
    public class AccessPackageController : Controller
    {
        private readonly IAccessPackageService _accessPackageService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessPackageController"/> class
        /// </summary>
        public AccessPackageController(IAccessPackageService accessPackageService, IHttpContextAccessor httpContextAccessor, ILogger<AccessPackageController> logger)
        {
            _accessPackageService = accessPackageService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        /// <summary>
        ///     Search through all access packages and return matches
        /// </summary>
        /// <returns>All search results, sorted into areas</returns>
        [HttpGet]
        [Authorize]
        [Route("search")]
        public async Task<ActionResult<List<AccessAreaFE>>> Search([FromQuery] string searchString)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
           {
                return await _accessPackageService.GetSearch(languageCode, searchString);
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
        ///     Get all access packages delegated to a single right holder from a single party
        /// </summary>
        /// <returns>A dictionary of lists (sorted by access area) containing all access package delegations that the right holder has on behalf of the specified right owner</returns>
        [HttpGet]
        [Authorize]
        [Route("delegations/{from}/{to}")]
        public async Task<ActionResult<Dictionary<string, List<AccessPackageDelegation>>>> GetDelegationsToRightHolder([FromRoute] Guid from, [FromRoute] Guid to)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
            {
                return await _accessPackageService.GetDelegationsToRightHolder(to, from, languageCode);
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
            catch
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, 500, "Unexpected exception occurred during fetching of access package delegations"));
            }
        }

        // For later use in display of all packages delegated on behalf of party
        /*
        /// <summary>
        ///     Get all access packages delegated from a single party
        /// </summary>
        /// <returns>List of access package with delegation recipients</returns>
        [HttpGet]
        [Authorize]
        [Route("delegations/{from}")]
        public async Task<ActionResult<List<AccessPackageRecipients>>> GetDelegationsFromParty([FromRoute] Guid from)
        */
    }
}
