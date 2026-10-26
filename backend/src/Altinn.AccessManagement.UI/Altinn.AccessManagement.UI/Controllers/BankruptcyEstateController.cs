using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
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
        [Route("hasadminaccess")]
        public async Task<ActionResult<bool>> HasAdminAccess(
            [FromQuery] Guid party,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                bool hasAccess = await _bankruptcyEstateService.HasBankruptcyEstateAdminAccess(party, cancellationToken);
                return Ok(hasAccess);
            }
            catch (HttpStatusException ex)
            {
                string responseContent = ex.Message;
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: responseContent));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "HasAdminAccess failed unexpectedly");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}
