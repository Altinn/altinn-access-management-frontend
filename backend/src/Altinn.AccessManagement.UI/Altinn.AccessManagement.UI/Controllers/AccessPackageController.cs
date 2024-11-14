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
        /// <returns>Paginated search results</returns>
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
    }
}
