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
    /// API for System User Agent delegation integrations.
    /// </summary>
    [Route("accessmanagement/api/v1/systemuser/agentdelegation")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemUserAgentDelegationController : ControllerBase
    {
        private readonly ISystemUserAgentDelegationService _systemUserAgentDelegationService;

        /// <summary>
        /// Constructor for <see cref="SystemUserAgentDelegationController"/>
        /// </summary>
        public SystemUserAgentDelegationController(ISystemUserAgentDelegationService systemUserAgentDelegationService)
        {
            _systemUserAgentDelegationService = systemUserAgentDelegationService;
        }

        /// <summary>
        /// Get all customers for the party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user to get customers from</param>
        /// <param name="partyUuid">Party uuid of party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of customer party</returns>
        [Authorize]
        [HttpGet("{partyId}/{systemUserGuid}/customers")]
        public async Task<ActionResult> GetSystemUserCustomers([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromQuery] Guid partyUuid, CancellationToken cancellationToken)
        {
            Result<List<CustomerPartyFE>> result = await _systemUserAgentDelegationService.GetSystemUserCustomers(partyId, systemUserGuid, partyUuid, cancellationToken);
            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }
            
            return Ok(result.Value);
        }

        /// <summary>
        /// Get agent delegations for this system user
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to get</param> 
        /// <param name="partyUuid">Party uuid of party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{systemUserGuid}/delegation")]
        public async Task<ActionResult> GetSystemUserAgentDelegations([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromQuery] Guid partyUuid, CancellationToken cancellationToken)
        {
            Result<List<AgentDelegationFE>> result = await _systemUserAgentDelegationService.GetSystemUserAgentDelegations(partyId, systemUserGuid, partyUuid, cancellationToken);
            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }
            
            return Ok(result.Value);
        }

        /// <summary>
        /// Add a customer as a new agent delegation to this systemuser
        /// </summary>
        /// <param name="partyId">Party id user represents</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="partyUuid">Party uuid of party user represents</param>
        /// <param name="delegationRequestFe">Payload to send to add client</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{systemUserGuid}/delegation")]
        public async Task<ActionResult> AddClient([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromQuery] Guid partyUuid, [FromBody] AgentDelegationRequestFE delegationRequestFe, CancellationToken cancellationToken)
        {
            Result<AgentDelegationFE> result = await _systemUserAgentDelegationService.AddClient(partyId, systemUserGuid, partyUuid, delegationRequestFe, cancellationToken);

            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
        }

        /// <summary>
        /// Remove an agent delegation from this systemuser
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="delegationId">Delegation id to remove from system user</param>
        /// <param name="partyUuid">Party uuid of party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpDelete("{partyId}/{systemUserGuid}/delegation/{delegationId}")]
        public async Task<ActionResult> RemoveClient([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromRoute] Guid delegationId, [FromQuery] Guid partyUuid, CancellationToken cancellationToken)
        {
            Result<bool> result = await _systemUserAgentDelegationService.RemoveClient(partyId, delegationId, partyUuid, cancellationToken);

            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
        }
    }
}