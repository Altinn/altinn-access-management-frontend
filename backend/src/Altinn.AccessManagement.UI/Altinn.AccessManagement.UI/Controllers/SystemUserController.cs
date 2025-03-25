using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Filters;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Controllers
{
    /// <summary>
    /// API for System User Integrations.
    /// Each System User integrates a Registered System with a Service for a given Party.
    /// Registered System could be Vendor's Products, such as Accounting systems etc,
    /// the Services could be Skatteetaten, NAV etc ...
    /// 
    /// The Party could be businesses using accounting software, with delegated authority
    /// to integrate with the Service.
    /// 
    /// The System User could also denote Single Rights or Rights Packages delegated to it
    /// from the Party; for the purpose of integrating the Product with the Service.
    /// </summary>
    [Route("accessmanagement/api/v1/systemuser")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemUserController : ControllerBase
    {
        private readonly ISystemUserService _systemUserService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Constructor for <see cref="SystemUserController"/>
        /// </summary>
        public SystemUserController(ISystemUserService systemUserService, IHttpContextAccessor httpContextAccessor)
        {
            _systemUserService = systemUserService;
            _httpContextAccessor = httpContextAccessor;
        }
        
        /// <summary>
        /// Used by the party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet("{partyId}")]
        public async Task<ActionResult> GetSystemUserListForLoggedInUser([FromRoute] int partyId, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            Result<List<SystemUserFE>> list = await _systemUserService.GetAllSystemUsersForParty(partyId, languageCode, cancellationToken);

            if (list.IsProblem)
            {
                return list.Problem.ToActionResult();
            }

            return Ok(list.Value);
        }

        /// <summary>
        /// Used by the party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{systemUserGuid}")]
        public async Task<ActionResult> GetSystemUserDetailsById([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            SystemUserFE details = await _systemUserService.GetSpecificSystemUser(partyId, systemUserGuid, languageCode, cancellationToken);
            
            if (details == null)
            {
                return NotFound();
            }

            return Ok(details);
        }
        
        /// <summary>
        /// Get all agent system users for given party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of agent system users</returns>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet("agent/{partyId}")]
        public async Task<ActionResult> GetAgentSystemUsersForParty([FromRoute] int partyId, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            Result<List<SystemUserFE>> list = await _systemUserService.GetAgentSystemUsersForParty(partyId, languageCode, cancellationToken);

            if (list.IsProblem)
            {
                return list.Problem.ToActionResult();
            }

            return Ok(list.Value);
        }

        /// <summary>
        /// Get a single agent system users for given party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">Agent system user id to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>A single agent system user</returns>
        [Authorize]
        [HttpGet("agent/{partyId}/{systemUserGuid}")]
        public async Task<ActionResult> GetAgentSystemUserDetailsById([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, CancellationToken cancellationToken)
        {
            var languageCode = LanguageHelper.GetSelectedLanguageCookieValueBackendStandard(_httpContextAccessor.HttpContext);
            SystemUserFE details = await _systemUserService.GetAgentSystemUser(partyId, systemUserGuid, languageCode, cancellationToken);

            if (details == null)
            {
                return NotFound();
            }

            return Ok(details);
        }

        /// <summary>
        /// Endpoint for delete agent system user
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to delete</param>
        /// <param name="facilitatorId">Party owning the system user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpDelete("agent/{partyId}/{systemUserGuid}")]
        public async Task<ActionResult> DeleteAgentSystemUser([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromQuery] Guid facilitatorId, CancellationToken cancellationToken)
        {
            bool result = await _systemUserService.DeleteAgentSystemUser(partyId, systemUserGuid, facilitatorId, cancellationToken);
            if (result)
            {
                return Accepted();
            }

            return NotFound();
        }

        /// <summary>
        /// Endpoint for creating a new System User for the choosen reportee.The reportee is taken from the AltinnPartyId cookie 
        /// 
        /// Expects backend in Authenticaiton and in Access Management to perform authorization ch
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="newSystemUser">The required params for a system to be created</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpPost("{partyId}")]
        public async Task<ActionResult> Post([FromRoute] int partyId, [FromBody] NewSystemUserRequest newSystemUser, CancellationToken cancellationToken)
        {
            Result<SystemUser> systemUserResult = await _systemUserService.CreateSystemUser(partyId, newSystemUser, cancellationToken);

            if (systemUserResult.IsProblem)
            {
                return systemUserResult.Problem.ToActionResult(); 
            }

            SystemUserCreateResponseFE createResponse = new SystemUserCreateResponseFE()
            {
                Id = systemUserResult.Value.Id,
            };
            return Ok(createResponse);
        }

        /// <summary>
        /// Endpoint for creating a new System User for the choosen reportee.The reportee is taken from the AltinnPartyId cookie 
        /// 
        /// Expects backend in Authenticaiton and in Access Management to perform authorization ch
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to delete</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpDelete("{partyId}/{systemUserGuid}")]
        public async Task<ActionResult> Delete([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, CancellationToken cancellationToken)
        {
            bool result = await _systemUserService.DeleteSystemUser(partyId, systemUserGuid, cancellationToken);
            if (result)
            {
                return Accepted();
            }

            return NotFound();
        }
    }
}