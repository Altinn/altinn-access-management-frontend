using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="BankruptcyEstateController"/> provides API endpoints related to bankruptcy estate administration.
    /// </summary>
    [Route("accessmanagement/api/v1/bankruptcyestate")]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class BankruptcyEstateController : ControllerBase    
    {
        private readonly ILogger<BankruptcyEstateController> _logger;

        private readonly IBankruptcyEstateService _bankruptcyEstateService;

        /// <summary>
        /// Initializes a new instance of the <see cref="BankruptcyEstateController"/> class.
        /// </summary>
        /// <param name="logger">The logger used to log information and errors.</param>
        /// <param name="bankruptcyEstateService">The service used to evaluate bankruptcy estate access.</param>
        public BankruptcyEstateController(
            IBankruptcyEstateService bankruptcyEstateService,
            ILogger<BankruptcyEstateController> logger)
        {
            _bankruptcyEstateService = bankruptcyEstateService;
            _logger = logger;
        }

        /// <summary>
        /// Endpoint for checking whether the authenticated user should see bankruptcy estate administration
        /// when acting on behalf of the given party.
        /// </summary>
        /// <param name="party">The uuid of the selected actor, expected to be a bostyrer. The answer is true only when this party has bankruptcy estates and the user may read them.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>True when the user should see bankruptcy estate administration; otherwise false.</returns>
        [HttpGet]
        [Authorize]
        [Route("isBankruptcyEstateAdmin")]
        public async Task<ActionResult<bool>> IsBankruptcyEstateAdmin(
            [FromQuery] Guid party,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                bool hasAccess = await _bankruptcyEstateService.IsBankruptcyEstateAdmin(party, cancellationToken);
                return Ok(hasAccess);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "IsBankruptcyEstateAdmin failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for retrieving the administrators of the bankruptcy estates of a party.
        /// </summary>
        /// <param name="party">The uuid of the selected actor, expected to be a bostyrer.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The administrators with the estates they have access to.</returns>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("administrators")]
        public async Task<ActionResult<IEnumerable<BankruptcyEstateAdministratorFE>>> GetAdministrators(
            [FromQuery] Guid party,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                IEnumerable<BankruptcyEstateAdministratorFE> administrators = await _bankruptcyEstateService.GetAdministrators(party, cancellationToken);
                return Ok(administrators);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAdministrators failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for adding a person as administrator of the bankruptcy estates of a party.
        /// </summary>
        /// <param name="party">The uuid of the selected actor, expected to be a bostyrer.</param>
        /// <param name="personInput">The person identifier and last name of the person to add.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Assignment details for the administrator.</returns>
        /// <response code="400">Bad Request</response>
        /// <response code="429">TooManyRequests</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("administrators")]
        public async Task<ActionResult<AssignmentDto>> AddAdministrator(
            [FromQuery] Guid party,
            [FromBody] PersonInput personInput,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                AssignmentDto assignment = await _bankruptcyEstateService.AddAdministrator(party, personInput, cancellationToken);
                return Ok(assignment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    return StatusCode((int)HttpStatusCode.TooManyRequests);
                }

                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AddAdministrator failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Endpoint for removing an administrator of the bankruptcy estates of a party.
        /// </summary>
        /// <param name="party">The uuid of the selected actor, expected to be a bostyrer.</param>
        /// <param name="user">The uuid of the administrator to remove.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <response code="204">No Content</response>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpDelete]
        [Authorize]
        [Route("administrators")]
        public async Task<IActionResult> RemoveAdministrator(
            [FromQuery] Guid party,
            [FromQuery] Guid user,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _bankruptcyEstateService.RemoveAdministrator(party, user, cancellationToken);
                return NoContent();
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RemoveAdministrator failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
