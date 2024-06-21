using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Register.Models;
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
        private readonly IUserService _profileService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserController"/> class
        /// </summary>
        public UserController(IUserService profileService, IHttpContextAccessor httpContextAccessor, ILogger<UserController> logger)
        {
            _profileService = profileService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        /// <summary>
        /// Method that returns the user information about the user that is logged in
        /// </summary>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet("profile")]
        public async Task<ActionResult> GetUser()
        {
            int userId = AuthenticationHelper.GetUserId(_httpContextAccessor.HttpContext);
            if (userId == 0)
            {
                return BadRequest("The userId is not provided in the context.");
            }

            try
            {
                var user = await _profileService.GetUserProfile(userId);

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
        /// Endpoint for retrieving party if party exists in the authenticated users reporteelist
        /// </summary>
        /// <param name="partyId">The partyId for the reportee to look up</param>
        /// <returns>Reportee if party is in authenticated users reporteelist</returns>
        [HttpGet]
        [Authorize]
        [Route("reporteelist/{partyId}")]
        public async Task<ActionResult<AuthorizedParty>> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                AuthorizedParty party = await _profileService.GetPartyFromReporteeListIfExists(partyId);

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
