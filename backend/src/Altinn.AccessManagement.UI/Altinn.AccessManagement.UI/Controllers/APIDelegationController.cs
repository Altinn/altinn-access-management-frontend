using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    ///     Controller responsible for all operations for managing maskinportenscehma delegations
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/apidelegation")]
    public class APIDelegationController : ControllerBase
    {
        private readonly IAPIDelegationService _apiDelegationService;
        private readonly IResourceService _resourceService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<APIDelegationController> _logger;
        private readonly IUserService _userService;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        ///     Initializes a new instance of the <see cref="APIDelegationController" /> class.
        /// </summary>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="apiDelegationService">The service implementation for handling maskinporten schema delegations</param>
        /// <param name="resourceService">The resource administration point</param>
        /// <param name="userService">The service implementation for user profile operations</param>
        /// <param name="httpContextAccessor">Accessor for httpcontext</param>
        public APIDelegationController(
            ILogger<APIDelegationController> logger,
            IAPIDelegationService apiDelegationService,
            IResourceService resourceService,
            IUserService userService,
            IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _apiDelegationService = apiDelegationService;
            _resourceService = resourceService;
            _userService = userService;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        ///     Endpoint for retrieving received Maskinporten resource delegation to the reportee party from others
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("{party}/received")]
        public async Task<ActionResult<List<MaskinportenSchemaDelegationFE>>> GetReceivedAPIDelegations([FromRoute] string party)
        {
            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);

                return await _apiDelegationService.GetReceivedMaskinportenSchemaDelegations(party, languageCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during retrieval of received maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for retrieving delegated MaskinportenSchema resources offered by the reportee party to others
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("{party}/offered")]
        public async Task<ActionResult<List<MaskinportenSchemaDelegationFE>>> GetOfferedAPIDelegations([FromRoute] string party)
        {
            try
            {
                var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
                return await _apiDelegationService.GetOfferedMaskinportenSchemaDelegations(party, languageCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during retrieval of offered maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for revoking a maskinporten scope delegation on behalf of the party having received the delegation
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("{party}/received/revoke")]
        public async Task<ActionResult> RevokeReceivedAPIDelegation([FromRoute] string party, [FromBody] RevokeReceivedDelegation delegation)
        {
            try
            {
                HttpResponseMessage response = await _apiDelegationService.RevokeReceivedMaskinportenScopeDelegation(party, delegation);

                if (response.StatusCode == HttpStatusCode.NoContent)
                {
                    return NoContent();
                }

                string responseContent = await response.Content.ReadAsStringAsync();
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during revoke of received maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for revoking a maskinporten scope delegation on behalf of the party having offered the delegation
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("{party}/offered/revoke")]
        public async Task<ActionResult> RevokeOfferedAPIDelegation([FromRoute] string party, [FromBody] RevokeOfferedDelegation delegation)
        {
            try
            {
                HttpResponseMessage response = await _apiDelegationService.RevokeOfferedMaskinportenScopeDelegation(party, delegation);

                if (response.StatusCode == HttpStatusCode.NoContent)
                {
                    return NoContent();
                }

                if (response.StatusCode == HttpStatusCode.BadRequest)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    ValidationProblemDetails problemDetails = JsonSerializer.Deserialize<ValidationProblemDetails>(responseContent, _serializerOptions);
                    return new ObjectResult(problemDetails);
                }
                else
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during revoke of offered maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for delegating a maskinporten schema resource from the reportee party to a third party organization
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("{party}/offered")]
        public async Task<ActionResult<DelegationOutput>> CreateMaskinportenDelegation([FromRoute] string party, [FromBody] DelegationInput delegation)
        {
            try
            {
                HttpResponseMessage response = await _apiDelegationService.CreateMaskinportenScopeDelegation(party, delegation);

                if (response.StatusCode == HttpStatusCode.Created)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<DelegationOutput>(responseContent, _serializerOptions);
                }

                if (response.StatusCode == HttpStatusCode.BadRequest)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    ValidationProblemDetails problemDetails = JsonSerializer.Deserialize<ValidationProblemDetails>(responseContent, _serializerOptions);
                    return new ObjectResult(problemDetails);
                }
                else
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during delegation of maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        ///     Endpoint for delegating one or more maskinporten schema resource from the reportee party to one or more third party organizations
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("{party}/offered/batch")]
        public async Task<ActionResult<List<ApiDelegationOutput>>> CreateMaskinportenDelegationBatch([FromRoute] string party, [FromBody] ApiDelegationInput delegation)
        {
            try
            {
                var response = await _apiDelegationService.BatchCreateMaskinportenScopeDelegation(party, delegation);
                return Ok(response);
            }
            catch
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Endpoint for performing a check if the user can delegate a maskinporten schema service to a specified reportee.
        /// </summary>
        /// <param name="partyId">The reportee's party id</param>
        /// <param name="request">Necessary info about the right that's going to be checked</param>
        [HttpPost]
        [Authorize]
        [Route("{partyId}/delegationcheck")]
        public async Task<ActionResult<List<DelegationResponseData>>> DelegationCheck([FromRoute] string partyId, [FromBody] Right request)
        {
            try
            {
                return await _apiDelegationService.DelegationCheck(partyId, request);
            }
            catch (Exception)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
    }
}
