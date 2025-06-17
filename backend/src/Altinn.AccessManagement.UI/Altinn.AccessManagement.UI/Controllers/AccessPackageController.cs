using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Register.Models;
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
        ///     Get all access package accesses granted to or from someone (one or more of the two must be specified)
        /// </summary>
        /// <returns>A dictionary of lists (sorted by access area-id) containing all access package delegations that the right holder has on behalf of the specified right owner</returns>
        [HttpGet]
        [Authorize]
        [Route("delegations/")]
        public async Task<ActionResult<Dictionary<Guid, List<PackagePermission>>>> GetDelegations([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] Guid? to)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!from.HasValue && !to.HasValue)
            {
                return BadRequest("Either 'from' or 'to' query parameter must be provided.");
            }

            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
            {
                return await _accessPackageService.GetDelegations(party, to, from, languageCode);
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
        /// <param name="party">The uuid of the party that is performing the access delegation</param>
        /// <param name="to">The id of the right holder that will receive the access</param>
        /// <param name="from">The id of the party that the rightholder will be granted access on behalf of</param>
        /// <param name="packageId">The id of the package to be delegated</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("delegations")]
        public async Task<ActionResult> CreateAccessPackageDelegation([FromQuery] Guid party, [FromQuery] Guid to, [FromQuery] Guid from, [FromQuery] string packageId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                HttpResponseMessage response = await _accessPackageService.CreateDelegation(party, to, from, packageId);
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
        /// <param name="party">The party that is performing the action (must be equal to either to or from)</param>
        /// <param name="packageId">The identifier of the access package that is to be revoked</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("delegations")]
        public async Task<ActionResult> RevokeAccessPackageAccess([FromQuery] Guid from, [FromQuery] Guid to, [FromQuery] Guid party, [FromQuery] string packageId)
        {
            if (!ModelState.IsValid || (party != to && party != from))
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrEmpty(packageId))
            {
                return BadRequest("PackageId is required");
            }

            try
            {
                var response = await _accessPackageService.RevokeAccessPackage(from, to, party, packageId);
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
        public async Task<ActionResult<List<AccessPackageDelegationCheckResponse>>> DelegationCheck([FromBody] DelegationCheckRequest delegationCheckRequest)
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
