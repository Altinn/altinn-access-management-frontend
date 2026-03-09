using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
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
        public async Task<ActionResult<List<InstanceDelegation>>> GetInstances([FromQuery] Guid party, [FromQuery] Guid? from, [FromQuery] Guid? to, [FromQuery] string resource, [FromQuery] string instance)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);

            try
            {
                List<InstanceDelegation> delegations = await _instanceService.GetInstances(languageCode, party, from, to, resource, instance);
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
        /// <param name="from">The party from which the instance would be delegated.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="instance">The instance urn.</param>
        /// <returns>The rights that can be delegated on the instance.</returns>
        [HttpGet]
        [Authorize]
        [Route("delegationcheck")]
        public async Task<ActionResult<List<RightCheck>>> GetDelegationCheck([FromQuery] Guid from, [FromQuery] string resource, [FromQuery] string instance)
        {
            try
            {
                List<RightCheck> result = await _instanceService.DelegationCheck(from, resource, instance);
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
        public async Task<ActionResult<InstanceRight>> GetInstanceRights(
            [FromQuery] Guid party,
            [FromQuery] Guid from,
            [FromQuery] Guid to,
            [FromQuery] string resource,
            [FromQuery] string instance)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);

            try
            {
                InstanceRight delegations = await _instanceService.GetInstanceRights(languageCode, party, from, to, resource, instance);
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
    }
}
