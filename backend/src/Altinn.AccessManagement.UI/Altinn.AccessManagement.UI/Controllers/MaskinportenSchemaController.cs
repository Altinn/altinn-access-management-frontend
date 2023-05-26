using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller responsible for all operations for managing delegations
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class MaskinportenSchemaController : ControllerBase
    {
        private readonly ILogger<MaskinportenSchemaController> _logger;
        private readonly IMaskinportenSchemaService _delegation;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IProfileService _profileService;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenSchemaController"/> class.
        /// </summary>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="delegationsService">The service implementation for handling maskinporten schema delegations</param>
        /// <param name="profileService">The service implementation for user profile operations</param>
        /// <param name="httpContextAccessor">Accessor for httpcontext</param>
        public MaskinportenSchemaController(
            ILogger<MaskinportenSchemaController> logger,
            IMaskinportenSchemaService delegationsService,
            IProfileService profileService,
            IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _delegation = delegationsService;
            _profileService = profileService;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Endpoint for retrieving received Maskinporten resource delegation to the reportee party from others
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/maskinportenschema/received")]
        public async Task<ActionResult<List<MaskinportenSchemaDelegationFE>>> GetReceivedMaskinportenSchemaDelegations([FromRoute] string party)
        {
            try
            {
                int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
                UserProfile userProfile = await _profileService.GetUserProfile(userId);
                string languageCode = ProfileHelper.GetLanguageCodeForUser(userProfile);
                return await _delegation.GetReceivedMaskinportenSchemaDelegations(party, languageCode);
            }
            catch (Exception ex)
            {
                if (ex is ValidationException || ex is ArgumentException)
                {
                    ModelState.AddModelError("Validation Error", ex.Message);
                    return new ObjectResult(ProblemDetailsFactory.CreateValidationProblemDetails(HttpContext, ModelState));
                }

                _logger.LogError(ex, "Unexpected exception occurred during retrieval of received maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated MaskinportenSchema resources offered by the reportee party to others
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/maskinportenschema/offered")]
        public async Task<ActionResult<List<MaskinportenSchemaDelegationFE>>> GetOfferedMaskinportenSchemaDelegations([FromRoute] string party)
        {
            try
            {
                int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
                UserProfile userProfile = await _profileService.GetUserProfile(userId);
                string languageCode = ProfileHelper.GetLanguageCodeForUser(userProfile);
                return await _delegation.GetOfferedMaskinportenSchemaDelegations(party, languageCode);
            }
            catch (Exception ex)
            {
                if (ex is ValidationException || ex is ArgumentException)
                {
                    ModelState.AddModelError("Validation Error", ex.Message);
                    return new ObjectResult(ProblemDetailsFactory.CreateValidationProblemDetails(HttpContext, ModelState));
                }

                _logger.LogError(ex, "Unexpected exception occurred during retrieval of offered maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Endpoint for revoking a maskinporten scope delegation on behalf of the party having received the delegation
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/maskinportenschema/received/revoke")]
        public async Task<ActionResult> RevokeReceivedMaskinportenScopeDelegation([FromRoute] string party, [FromBody] RevokeReceivedDelegation delegation)
        {
            try
            {
                HttpResponseMessage response = await _delegation.RevokeReceivedMaskinportenScopeDelegation(party, delegation);

                if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
                {
                    return NoContent();
                }
                else
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during revoke of received maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Endpoint for revoking a maskinporten scope delegation on behalf of the party having offered the delegation
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/maskinportenschema/offered/revoke")]
        public async Task<ActionResult> RevokeOfferedMaskinportenScopeDelegation([FromRoute] string party, [FromBody] RevokeOfferedDelegation delegation)
        {
            try
            {
                HttpResponseMessage response = await _delegation.RevokeOfferedMaskinportenScopeDelegation(party, delegation);

                if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
                {
                    return NoContent();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
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
        /// Endpoint for delegating a maskinporten schema resource from the reportee party to a third party organization
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/maskinportenschema/offered")]
        public async Task<ActionResult<DelegationOutput>> CreateMaskinportenDelegation([FromRoute] string party, [FromBody] DelegationInput delegation)
        {
            try
            {
                HttpResponseMessage response = await _delegation.CreateMaskinportenScopeDelegation(party, delegation);

                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<DelegationOutput>(responseContent, _serializerOptions);
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
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
    }
}
