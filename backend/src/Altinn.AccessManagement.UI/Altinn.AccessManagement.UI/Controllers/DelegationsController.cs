using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Authorization.ABAC.Xacml;
using Altinn.Platform.Register.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller responsible for all operations for managing delegations
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class DelegationsController : ControllerBase
    {
        private readonly ILogger<DelegationsController> _logger;
        private readonly IDelegationsService _delegation;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationsController"/> class.
        /// </summary>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="delegationsService">the handler for delegations service</param>
        public DelegationsController(
            ILogger<DelegationsController> logger,
            IDelegationsService delegationsService)
        {
            _logger = logger;
            _delegation = delegationsService;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
        }

        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/delegations/maskinportenschema/received")]
        public async Task<ActionResult<List<DelegationsFE>>> GetAllInboundDelegations([FromRoute] string party)
        {
            if (string.IsNullOrEmpty(party))
            {
                return BadRequest("Missing reportee party");
            }

            try
            {
                List<DelegationsFE> delegations = await _delegation.GetAllInboundDelegationsAsync(party);                

                return delegations;
            }
            catch (ArgumentException)
            {
                return BadRequest("Either the reportee is not found or the supplied value for who is not in a valid format");
            }
            catch (Exception ex)
            {
                string errorMessage = ex.Message;
                _logger.LogError("Failed to fetch outbound delegations, See the error message for more details {errorMessage}", errorMessage);
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/delegations/maskinportenschema/offered")]
        public async Task<ActionResult<List<DelegationsFE>>> GetAllOutboundDelegations([FromRoute] string party)
        {
            if (string.IsNullOrEmpty(party))
            {
                return BadRequest("Missing reportee party");
            }

            try
            {
                List<DelegationsFE> delegations = await _delegation.GetAllOutboundDelegationsAsync(party);                

                return delegations;
            }
            catch (ArgumentException)
            {
                return BadRequest("Either the reportee is not found or the supplied value for who is not in a valid format");
            }
            catch (Exception ex)
            {
                string errorMessage = ex.Message;
                _logger.LogError("Failed to fetch outbound delegations, See the error message for more details {errorMessage}", errorMessage);
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/delegations/maskinportenschema/received/revoke")]
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
                    ModelState.AddModelError(response.StatusCode.ToString(), response.ReasonPhrase);                   
                    return new ObjectResult(ProblemDetailsFactory.CreateValidationProblemDetails(HttpContext, ModelState));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal exception occurred during deletion of maskinportenschema delegation");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/delegations/maskinportenschema/offered/revoke")]
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
                    ProblemDetails problemDetails = JsonSerializer.Deserialize<ProblemDetails>(responseContent, _serializerOptions);
                    return new ObjectResult(problemDetails);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred during deletion of maskinportenschema delegation");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("accessmanagement/api/v1/{party}/delegations/maskinportenschema/")]
        public async Task<ActionResult<DelegationOutput>> CreateMaskinportenDelegation([FromRoute] string party, [FromBody] DelegationInput delegation)
        {
            try
            {
                HttpResponseMessage response = await _delegation.CreateMaskinportenScopeDelegation(party, delegation);

                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    DelegationOutput delegationOutput = JsonSerializer.Deserialize<DelegationOutput>(responseContent, _serializerOptions);
                    return delegationOutput;
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
                    ProblemDetails problemDetails = JsonSerializer.Deserialize<ProblemDetails>(responseContent, _serializerOptions);
                    return new ObjectResult(problemDetails);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal exception occurred during delegation of maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
        
        /*
        /// <summary>
        /// Endpoint for retrieving delegated resources between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("accessmanagement/api/v1/delegations/delegateapi")]
        public async Task<ActionResult<DelegationOutput>> DelegateApi([FromBody] DelegationRequest delegation)
        {
            try
            {
                HttpResponseMessage response = await _delegation.CreateMaskinportenScopeDelegation(delegation.OrganizationNumber, delegation.ApiIdentifier);

                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    DelegationOutput delegationOutput = JsonSerializer.Deserialize<DelegationOutput>(responseContent, _serializerOptions);
                    return delegationOutput;
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
                    ProblemDetails problemDetails = JsonSerializer.Deserialize<ProblemDetails>(responseContent, _serializerOptions);
                    return new ObjectResult(problemDetails);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal exception occurred during delegation of maskinportenschema");
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }*/
    }
}
