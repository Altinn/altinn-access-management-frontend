using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// Controller responsible for all operations for lookup
    /// </summary>
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    [Route("accessmanagement/api/v1/lookup/")]
    public class LookupController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly ILookupService _lookupService;

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupController"/> class.
        /// </summary>
        /// <param name="logger">the logger.</param>
        /// <param name="lookupService">service implementation for lookups</param>
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
        [Route("org/{orgNummer}")]
        public async Task<ActionResult<PartyFE>> GetOrganisation(string orgNummer)
        {
            try
            {
                PartyFE party = await _lookupService.GetPartyForOrganization(orgNummer);

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
        /// Endpoint for retrieving the party from logged in user.
        /// </summary>
        /// <returns>Party information for the GUI</returns>
        [HttpGet]
        [Authorize]
        [Route("party/user")]
        public async Task<ActionResult<PartyFE>> GetPartyFromLoggedInUser()
        {
            if (ModelState.IsValid == false)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateValidationProblemDetails(HttpContext, ModelState, 400));
            }

            try
            {
                Guid? userUuid = AuthenticationHelper.GetUserPartyUuid(HttpContext);

                if (!userUuid.HasValue || userUuid == Guid.Empty)
                {
                    return new ObjectResult(ProblemDetailsFactory.CreateValidationProblemDetails(HttpContext, ModelState, 400, detail: "Missing or invalid user uuid in token"));
                }

                PartyFE party = await _lookupService.GetPartyFromLoggedInUser(userUuid.Value);
    
                if (party != null)
                {
                    return party;
                }

                return StatusCode(404);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetPartyFromLoggedInUser failed to fetch party information");
                return StatusCode(500);
            }
        }
    }
}
