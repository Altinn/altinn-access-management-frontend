using System.Net;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// The <see cref="UserController"/> provides the API endpoints related to persons.
    /// </summary>
    [Route("accessmanagement/api/v1/user")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserController"/> class
        /// </summary>
        public UserController(IUserService profileService, IHttpContextAccessor httpContextAccessor, ILogger<UserController> logger)
        {
            _userService = profileService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        /// <summary>
        /// Method that returns the user information about the user that is logged in
        /// </summary>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileFE>> GetUser()
        {
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            if (userId == 0)
            {
                return BadRequest("The userId is not provided in the context.");
            }

            try
            {
                UserProfileFE user = await _userService.GetUserProfile(userId);

                if (user == null)
                {
                    return NotFound();
                }

                return Ok(user);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        /// <summary>
        /// Endpoint for reportees the authenticated user can act on behalf of
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize]
        [Route("actorlist")]
        public async Task<ActionResult<List<AuthorizedParty>>> GetReporteeListForUser()
        {
            try
            {
                List<AuthorizedParty> reporteelist = await _userService.GetReporteeListForUser();

                if (reporteelist != null)
                {
                    return reporteelist;
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


        /// <summary>
        /// Endpoint for retrieving party if party exists in the authenticated users reporteelist
        /// </summary>
        /// <param name="partyId">The partyId for the reportee to look up</param>
        /// <returns>Reportee if party is in authenticated users reporteelist</returns>
        [HttpGet]
        [Authorize]
        [Route("reportee/{partyId}")]
        public async Task<ActionResult<AuthorizedParty>> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                AuthorizedParty party = await _userService.GetPartyFromReporteeListIfExists(partyId);

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

        /// <summary>
        /// Endpoint for retrieving all right holders of a reportee
        /// </summary>
        /// <param name="partyId">The partyId for the reportee who's right holders to return</param>
        /// <returns>List of right holders</returns>
        [HttpGet]
        [Authorize]
        [Route("reportee/{partyId}/rightholders")]
        public async Task<ActionResult<List<User>>> GetReporteeRightHolders(int partyId)
        {
            try
            {
                string userPartyID = AuthenticationHelper.GetUserPartyId(_httpContextAccessor.HttpContext);

                List<User> rightHolders = await _userService.GetReporteeRightHolders(partyId);

                return rightHolders;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetReportee failed to fetch right holders");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving all right holders of a reportee
        /// </summary>
        /// <param name="partyUuid">The partyId for the reportee whose right holders to return</param>
        /// <returns>List of right holders</returns>
        [HttpGet]
        [Authorize]
        [Route("reporteelist/{partyUuid}")]
        public async Task<ActionResult<List<User>>> GetReporteeList(Guid partyUuid)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                return await _userService.GetReporteeList(partyUuid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetReportee failed to fetch right holders");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for validating a new rightholder through an ssn and last name combination.
        /// If the ssn and last name does not match, the endpoint will return 404.
        /// If the endpont is called with unmatching input too many times, the user calling the endpoint will be blocked for an hour and the request will return 429.
        /// If the combination is valid, the endpoint will return the partyUuid of the person.
        /// </summary>
        /// <param name="validationInput">The ssn and last name of the person to be looked up</param>
        /// <returns>The partyUuid of the person</returns>
        /// <response code="400">Bad Request</response>
        /// <response code="500">Internal Server Error</response>
        [HttpPost]
        [Authorize]
        [Route("reportee/{partyId}/rightholder/validateperson")]
        public async Task<ActionResult<Guid>> ValidatePerson([FromBody] ValidatePersonInput validationInput)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                Guid? partyUuid = await _userService.ValidatePerson(validationInput.Ssn, validationInput.LastName);

                if (partyUuid != null)
                {
                    return partyUuid;
                }
                else
                {
                    return StatusCode(404);
                }
            }
            catch (HttpStatusException ex)
            {
                if (ex.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    return StatusCode(429);
                }
                else
                {
                    return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response", detail: ex.Message));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ValidatePerson failed unexpectedly");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving all accesses a specified user has on behalf of a party
        /// </summary>
        /// <param name="from">The uuid for the user which the right holder has access to</param>
        /// <param name="to">The uuid for the user whose accesses are to be returned</param>
        /// <returns>All accesses a user (to) has on behalf of a party (from)</returns>
        [HttpGet]
        [Authorize]
        [Route("from/{from}/to/{to}/accesses")]
        public async Task<ActionResult<UserAccesses>> GetUserAccesses(Guid from, Guid to)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                string userPartyID = AuthenticationHelper.GetUserPartyId(_httpContextAccessor.HttpContext);

                UserAccesses accesses = await _userService.GetUserAccesses(from, to);

                return accesses;
            }
            catch (HttpStatusException ex)
            {
                return new ObjectResult(ProblemDetailsFactory.CreateProblemDetails(HttpContext, (int?)ex.StatusCode, "Unexpected HttpStatus response"));
            }
        }
    }
}
