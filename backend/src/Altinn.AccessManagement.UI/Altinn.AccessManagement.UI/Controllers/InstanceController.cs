using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller for instance delegation operations.
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/instances")]
    public class InstanceController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IInstanceService _instanceService;
        private readonly ILogger<InstanceController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceController"/> class.
        /// </summary>
        /// <param name="instanceService">The instance delegation service.</param>
        /// <param name="httpContextAccessor">Accessor for the current http context.</param>
        /// <param name="logger">Logger instance.</param>
        public InstanceController(
            IInstanceService instanceService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<InstanceController> logger)
        {
            _instanceService = instanceService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        /// <summary>
        /// Gets delegated instances for the specified parties.
        /// </summary>
        /// <param name="party">The acting party asking for the delegations.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">Optional resource identifier filter.</param>
        /// <param name="instance">Optional instance urn filter.</param>
        /// <returns>The delegated instances.</returns>
        [HttpGet]
        [Authorize]
        [Route("delegation/instances")]
        public async Task<ActionResult<List<InstanceDelegation>>> GetDelegatedInstances([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] Guid? to, [FromQuery] string resource, [FromQuery] string instance)
        {
            if (!from.HasValue && !to.HasValue)
            {
                return BadRequest("Either 'from' or 'to' query parameter must be provided.");
            }

            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);

            try
            {
                List<InstanceDelegation> delegations = await _instanceService.GetDelegatedInstances(languageCode, party, from, to, resource, instance);
                return Ok(delegations);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred while retrieving instance delegations for right holder: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Gets the rights a user can delegate on a particular instance.
        /// </summary>
        /// <param name="party">The party for which the delegation check is performed.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The rights that can be delegated on the instance.</returns>
        [HttpGet]
        [Authorize]
        [Route("delegationcheck")]
        public async Task<ActionResult<List<RightCheck>>> GetDelegationCheck([FromQuery] Guid party, [FromQuery] string resource, [FromQuery] string instance)
        {
            try
            {
                List<RightCheck> result = await _instanceService.DelegationCheck(party, resource, instance);
                return Ok(result);
            }
            catch (HttpStatusException statusEx)
            {
                string responseContent = statusEx.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)statusEx.StatusCode, "Unexpected HttpStatus response from backend", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred while retrieving instance delegation check: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Delegates a given set of rights on an instance.
        /// </summary>
        /// <param name="party">The acting party performing the delegation.</param>
        /// <param name="to">The receiving party when delegating to an existing connection.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <param name="input">The delegation input, including right keys and optional person details for new recipients.</param>
        /// <response code="200">OK</response>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("delegation/instances/rights")]
        public async Task<ActionResult<HttpResponseMessage>> DelegateInstanceRights([FromQuery] Guid party, [FromQuery] Guid? to, [FromQuery] string resource, [FromQuery] string instance, [FromBody] InstanceRightsDelegationDto input)
        {
            if (!to.HasValue && input?.To == null)
            {
                return BadRequest("At least one recipient must be specified.");
            }

            if (to.HasValue && input?.To != null)
            {
                return BadRequest("Recipient must be specified either via the 'to' query parameter or the request body, not both.");
            }

            try
            {
                var response = await _instanceService.Delegate(party, to, resource, instance, input);
                if (response.IsSuccessStatusCode)
                {
                    return Ok(await response.Content.ReadAsStringAsync());
                }

                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Error returned from backend"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred while adding instance rights for right holder: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Gets delegated rights for a specific instance.
        /// </summary>
        /// <param name="party">The acting party asking for the rights.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The delegated rights for the instance.</returns>
        [HttpGet]
        [Authorize]
        [Route("delegation/instances/rights")]
        public async Task<ActionResult<InstanceRights>> GetInstanceRights(
            [FromQuery] Guid party,
            [FromQuery] Guid from,
            [FromQuery] Guid to,
            [FromQuery] string resource,
            [FromQuery] string instance)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);

            try
            {
                InstanceRights delegations = await _instanceService.GetInstanceRights(languageCode, party, from, to, resource, instance);
                return Ok(delegations);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred while retrieving instance right delegations for right holder: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Updates delegated rights on a specific instance.
        /// </summary>
        /// <param name="party">The acting party performing the update.</param>
        /// <param name="to">The receiving party.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <param name="actionKeys">The updated rights/actions for the delegation.</param>
        /// <response code="200">OK</response>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPut]
        [Authorize]
        [Route("delegation/instances/rights")]
        public async Task<ActionResult<HttpResponseMessage>> EditInstanceAccess([FromQuery] Guid party, [FromQuery] Guid to, [FromQuery] string resource, [FromQuery] string instance, [FromBody] List<string> actionKeys)
        {
            try
            {
                var response = await _instanceService.UpdateInstanceAccess(party, to, resource, instance, actionKeys);
                if (response.IsSuccessStatusCode)
                {
                    return Ok(await response.Content.ReadAsStringAsync());
                }

                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Error returned from backend"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during update of instance access: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }

        /// <summary>
        /// Gets all users who have direct access to a specific instance (simplified party info).
        /// Limited endpoint for instance admins without full admin access.
        /// Proxies to backend: GET enduser/connections/resources/instances/users
        /// </summary>
        /// <param name="party">The party UUID.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance URN.</param>
        /// <returns>List of simplified parties representing users with access to the instance.</returns>
        [HttpGet]
        [Authorize]
        [Route("delegation/instances/simplified/users")]
        public async Task<ActionResult<List<SimplifiedParty>>> GetInstanceUsers(
            [FromQuery] Guid party,
            [FromQuery] string resource,
            [FromQuery] string instance)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var users = await _instanceService.GetInstanceUsers(party, resource, instance);
                return Ok(users);
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetInstanceUsers failed unexpectedly");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Removes an instance delegation and all its rights.
        /// </summary>
        /// <param name="party">The acting party performing the removal.</param>
        /// <param name="from">The party the instance access was delegated from.</param>
        /// <param name="to">The party the instance access was delegated to.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <response code="200">OK</response>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("delegation/instances")]
        public async Task<ActionResult> RemoveInstance([FromQuery] Guid party, [FromQuery] Guid from, [FromQuery] Guid to, [FromQuery] string resource, [FromQuery] string instance)
        {
            try
            {
                var response = await _instanceService.RemoveInstance(party, from, to, resource, instance);
                if (response.IsSuccessStatusCode)
                {
                    return Ok(response);
                }

                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)response.StatusCode, "Error returned from backend"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected exception occurred during removal of instance delegation: {Message}", ex.Message);
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext));
            }
        }
    }
}
