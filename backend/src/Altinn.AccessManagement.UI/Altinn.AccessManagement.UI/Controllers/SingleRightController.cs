using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller responsible for all operations regarding single rights
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/singleright")]
    public class SingleRightController : Controller
    {
        private readonly ILogger<SingleRightController> _logger;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly ISingleRightService _singleRightService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SingleRightController" /> class
        /// </summary>
        public SingleRightController(
            ISingleRightService singleRightService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<SingleRightController> logger)
        {
            _singleRightService = singleRightService;
            _httpContextAccessor = httpContextAccessor;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            _logger = logger;
        }

        /// <summary>
        ///     Endpoint for checking delegation accesses on behalf of the party having offered the delegation
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost("checkdelegationaccesses/{partyId}")]
        [Authorize]
        public async Task<ActionResult<List<DelegationResponseData>>> CheckDelegationAccess([FromRoute] string partyId, [FromBody] Right request)
        {
            try
            {
                HttpResponseMessage response = await _singleRightService.CheckDelegationAccess(partyId, request);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<List<DelegationResponseData>>(responseContent, _serializerOptions);
                }

                if (response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, response.StatusCode == HttpStatusCode.BadRequest ? "Bad request" : "Unauthorized from backend", detail: responseContent));
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

        /// <summary>
        ///     Endpoint for delegating a single right from the reportee party to a third party
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("delegate/{party}")]
        public async Task<ActionResult<DelegationOutput>> CreateDelegation([FromRoute] string party, [FromBody] DelegationInput delegation)
        {
            try
            {
                HttpResponseMessage response = await _singleRightService.CreateDelegation(party, delegation);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<DelegationOutput>(responseContent, _serializerOptions);
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

        /// <summary>
        ///     Endpoint for clearing cash on accesses of the given recipient on behalf of the provided party
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPut]
        [Authorize]
        [Route("{party}/accesscache/clear")]
        public async Task<IActionResult> ClearAccessCache([FromRoute] string party, [FromBody] BaseAttribute recipient)
        {
            try
            {
                HttpResponseMessage response = await _singleRightService.ClearAccessCacheOnRecipient(party, recipient);

                if (!response.IsSuccessStatusCode)
                {
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int)response.StatusCode, detail: $"Could not complete the request. Reason: {response.ReasonPhrase}"));
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during delegation of resource:" + ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for getting single rights for a right holder
        /// </summary>
        /// <param name="party">The party identifier</param>
        /// <param name="userId">The user identifier</param>
        /// <response code="200">OK</response>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("{party}/rightholder/{userId}")]
        public async Task<ActionResult<List<ResourceDelegation>>> GetSingleRightsForRightholder([FromRoute] string party, [FromRoute] string userId)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            try
            {
                List<ResourceDelegation> delegations = await _singleRightService.GetSingleRightsForRightholder(languageCode, party, userId);
                return Ok(delegations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred while retrieving single rights for right holder: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for revoking all rights on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted. Provided on urn format</param>
        /// <param name="to">The right holder that has been granted access to the resource. Provided on urn format</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("{from}/{to}/{resourceId}/revoke")]
        public async Task<ActionResult> RevokeResourceAccess([FromRoute] string from, [FromRoute] string to, [FromRoute] string resourceId)
        {
            try
            {
                var response = await _singleRightService.RevokeResourceAccess(to, from, resourceId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during revoke of a resource");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for editing what rights are granted from one party to another on a specific resource.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted. Provided on urn format</param>
        /// <param name="to">The right holder that has been granted access to the resource. Provided on urn format</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <param name="update">The rights to be edited (delegated and deleted)</param>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("{from}/{to}/{resourceId}/edit")]
        public async Task<ActionResult> EditResourceAccess([FromRoute] string from, [FromRoute] string to, [FromRoute] string resourceId, [FromBody] RightChanges update)
        {
            try
            {
                var response = await _singleRightService.EditResourceAccess(from, to, resourceId, update);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during revoke of single right");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
    }
}
