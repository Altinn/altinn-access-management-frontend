using Altinn.AccessManagement.Core.Constants;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

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
        private readonly FeatureFlags _featureFlags;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserController"/> class
        /// </summary>
        public UserController(
            IUserService profileService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<UserController> logger,
            IOptions<FeatureFlags> featureFlags)
        {
            _userService = profileService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _featureFlags = featureFlags.Value;
        }

        /// <summary>
        /// Method that returns the user information about the user that is logged in.
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
        /// Endpoint for reportees the authenticated user can act on behalf of.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize]
        [Route("actorlist/old")]
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
        /// Endpoint for getting the list of party connections the authenticated user can act on behalf of.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize]
        [Route("actorlist")]
        public async Task<ActionResult<List<Connection>>> GetActorListForAuthenticatedUser()
        {
            try
            {
                Guid authenticatedUserUuid = AuthenticationHelper.GetUserPartyUuid(_httpContextAccessor.HttpContext);
                List<Connection> reporteelist = await _userService.GetActorListForUser(authenticatedUserUuid);

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
                _logger.LogError(ex, "GetActorListForAuthenticatedUser failed to fetch actorlist information");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for getting the favorite actors of the authenticated user.
        /// </summary>
        /// <returns>A lost of partyUuids</returns>
        [HttpGet]
        [Authorize]
        [Route("actorlist/favorites")]
        public async Task<ActionResult<List<string>>> GetFavoriteActorUuids()
        {
            try
            {
                List<string> favorites = await _userService.GetFavoriteActorUuids();

                if (favorites != null)
                {
                    return favorites;
                }
                else
                {
                    return StatusCode(404);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetFavoriteActorUuids failed to fetch actorlist information");
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Endpoint for retrieving party if party exists in the authenticated users reporteelist.
        /// </summary>
        /// <param name="partyId">The partyId for the reportee to look up.</param>
        /// <returns>Reportee if party is in authenticated users reporteelist.</returns>
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
        /// Endpoint for checking if the authenticated user has access to a resource.
        /// </summary>
        [HttpGet]
        [Authorize(Policy = AuthzConstants.POLICY_ACCESS_MANAGEMENT_ENDUSER_READ_WITH_PASS_THROUGH)]
        [Route("isAdmin")]
        public ActionResult<bool> IsAdmin()
        {
            if (_httpContextAccessor.HttpContext.Items.TryGetValue("HasRequestedPermission", out object hasPermissionObj) &&
                hasPermissionObj is bool hasPermission)
            {
                return Ok(hasPermission);
            }

            return Ok(false);
        }

        /// <summary>
        /// Endpoint for checking if the authenticated user has access to client admin resource.
        /// </summary>
        [HttpGet]
        [Authorize(Policy = AuthzConstants.POLICY_ACCESS_MANAGEMENT_CLIENT_ADMINISTRATION_READ_WITH_PASS_THROUGH)]
        [Route("isClientAdmin")]
        public ActionResult<bool> IsClientAdmin()
        {
            if (_httpContextAccessor.HttpContext.Items.TryGetValue("HasRequestedPermission", out object hasPermissionObj) &&
                hasPermissionObj is bool hasPermission)
            {
                return Ok(hasPermission);
            }

            return Ok(false);
        }

        /// <summary>
        /// Endpoint for checking if the authenticated user has access to the altinn profil api varslingsdaresser for virksomheter resource.
        /// </summary>
        [HttpGet]
        [Authorize(Policy = AuthzConstants.POLICY_ACCESS_MANAGEMENT_PROFIL_API_VARSLINGSDARESSER_FOR_VIRKSOMHETER_READ_WITH_PASS_THROUGH)]
        [Route("isCompanyProfileAdmin")]
        public ActionResult<bool> IsCompanyProfileAdmin()
        {
            if (_httpContextAccessor.HttpContext.Items.TryGetValue("HasRequestedPermission", out object hasPermissionObj) &&
                hasPermissionObj is bool hasPermission)
            {
                return Ok(hasPermission);
            }

            return Ok(false);
        }
    }
}
