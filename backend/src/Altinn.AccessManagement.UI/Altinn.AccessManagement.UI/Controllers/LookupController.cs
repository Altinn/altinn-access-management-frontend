using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Platform.Register.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller responsible for all operations for lookup
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class LookupController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly ILookupService _lookupService;

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupController"/> class.
        /// </summary>
        /// <param name="logger">the logger.</param>
        /// <param name="mapper">mapper handler</param>
        /// <param name="register">handler for register</param>
        /// <param name="contextRetrieval">handler for context retrieval</param>
        public LookupController(
            ILogger<LookupController> logger,
            ILookupService lookupService)
        {
            _logger = logger;
            _lookupService = lookupService;
        }

        /// <summary>
        /// Endpoint for retrieving delegated rules between parties
        /// </summary>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/lookup/org/{orgNummer}")]
        public async Task<ActionResult<Party>> GetOrganisation(string orgNummer)
        {
            try
            {
                Party party = await _lookupService.GetOrganisation(orgNummer);

                if (party == null)
                {
                    return new ObjectResult(ProblemDetailsFactory.CreateValidationProblemDetails(HttpContext, ModelState, 400));
                }
                else
                {
                    return party;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetOrganisation failed to fetch organisation information");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving party if party exists in the authenticated users reporteelist
        /// </summary>
        /// <param name="partyId">The partyId for the reportee to look up</param>
        /// <returns>Reportee if party is in authenticated users reporteelist</returns>
        [HttpGet]
        [Authorize]
        [Route("accessmanagement/api/v1/lookup/reportee/{partyId}")]
        public async Task<ActionResult<Party>> GetPartyFromReporteeListIfExists(int partyId)
        {           
            try
            {
                Party party = await _lookupService.GetPartyFromReporteeListIfExists(partyId);

                if (party != null)
                {
                    return party;
                }
                else
                {
                    return StatusCode(404);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetReportee failed to fetch reportee information");
                return StatusCode(500);
            }
        }
    }
}
