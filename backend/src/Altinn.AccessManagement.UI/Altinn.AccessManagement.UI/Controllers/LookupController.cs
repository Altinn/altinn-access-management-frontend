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
        /// Endpoint for retrieving a party by uuid
        /// </summary>
        /// <param name="uuid">The uuid for the party to look up</param>
        /// <returns>Party information for the GUI</returns>
        /// <remarks>
        /// This endpoint is deprecated and should not be used in new code.
        /// It can be removed when the old access management frontend is decommissioned.
        /// Use GET party/user for logged-in user data, or use the new secure party lookup mechanisms 
        /// that verify the relationship between the acting party and the requested party.
        /// </remarks>
        [Obsolete("This endpoint is deprecated. Use GET party/user for logged-in user data, or use secure party lookup mechanisms that verify party relationships.")]
        [HttpGet]
        [Authorize]
        [Route("party/{uuid}")]
        public async Task<ActionResult<PartyFE>> GetPartyByUUID(Guid uuid)
        {
            try
            {
                PartyFE party = await _lookupService.GetPartyByUUID_old(uuid);

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
