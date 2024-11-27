using Altinn.AccessManagement.UI.Core.Models;
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
        /// Endpoint for retrieving a party by uuid
        /// </summary>
        /// <param name="uuid">The uuid for the party to look up</param>
        /// <returns>Party information for the GUI</returns>
        [HttpGet]
        [Authorize]
        [Route("party/{uuid}")]
        public async Task<ActionResult<PartyFE>> GetPartyByUUID(Guid uuid)
        {
            try
            {
                PartyFE party = await _lookupService.GetPartyByUUID(uuid);

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
                _logger.LogError(ex, "GetPartyByUUID failed to fetch party information");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving a user by uuid
        /// </summary>
        /// <param name="uuid">The uuid for the user to look up</param>
        /// <returns>Party information for the GUI</returns>
        [HttpGet]
        [Authorize]
        [Route("user/{uuid}")]
        public async Task<ActionResult<UserProfileFE>> GetUserByUUID(Guid uuid)
        {
            try
            {
                UserProfileFE user = await _lookupService.GetUserByUUID(uuid);

                if (user != null)
                {
                    return user;
                }
                else
                {
                    return StatusCode(404);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetUserByUUID failed to fetch party information");
                return StatusCode(500);
            }
        }
    }
}
