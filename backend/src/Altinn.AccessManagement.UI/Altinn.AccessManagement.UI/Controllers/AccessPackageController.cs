using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Services;
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
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessPackageController"/> class
        /// </summary>
        public AccessPackageController(IAccessPackageService accessPackageService, IHttpContextAccessor httpContextAccessor, ILogger<AccessPackageController> logger)
        {
            _accessPackageService = accessPackageService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
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
        /// <returns>A dictionary of lists (sorted by access area-id) containing all access package delegations that the right holder has on behalf of the specified right owner</returns>
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

        /// <summary>
        ///     Endpoint for delegating a accesspackage from the reportee party to a third party
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("delegate/{party}/{packageId}/{to}")]
        public async Task<ActionResult> CreateAccessPackageDelegation([FromRoute] string party, [FromRoute] string packageId, [FromRoute] Guid to)
        {
            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);

                HttpResponseMessage response = await _accessPackageService.CreateDelegation(party, to, packageId, languageCode);
                if (response.IsSuccessStatusCode)
                {
                    return Ok(await response.Content.ReadAsStringAsync());
                }

                if (response.StatusCode == HttpStatusCode.BadRequest)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Bad request", detail: responseContent));
                }
                else
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during delegation of resource:" + ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
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

        /// <summary>
        ///     Endpoint for revoking access to an access package that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted. Provided on urn format</param>
        /// <param name="to">The right holder that has been granted access to the resource. Provided on urn format</param>
        /// <param name="packageId">The identifier of the access package that is to be revoked</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("{from}/{to}/{packageId}/revoke")]
        public async Task<ActionResult> RevokeAccessPackageAccess([FromRoute] Guid from, [FromRoute] Guid to, [FromRoute] string packageId)
        {
            try
            {
                var response = await _accessPackageService.RevokeAccessPackage(from, to, packageId);
                return Ok(response);
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
        ///     Check if a set of packages can be delegated
        /// </summary>
        /// <returns>If the packages can be delegated and the DetailCode for why</returns>
        [HttpPost]
        [Authorize]
        [Route("delegationcheck")]
        public async Task<ActionResult<List<AccessPackageDelegationCheckResponse>>> RoleDelegationCheck([FromBody] DelegationCheckRequest delegationCheckRequest)
        {
            if (!ModelState.IsValid || delegationCheckRequest.PackageIds == null || delegationCheckRequest.PackageIds.Length == 0)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                return await _accessPackageService.DelegationCheck(delegationCheckRequest);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
        }
    }
}
