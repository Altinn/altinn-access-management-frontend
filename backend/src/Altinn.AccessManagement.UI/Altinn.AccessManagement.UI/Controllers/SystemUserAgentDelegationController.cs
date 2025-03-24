using Altinn.AccessManagement.UI.Core.Enums;
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
        /// <param name="facilitatorId">Party uuid user represents</param>
        /// <param name="systemUserGuid">System user to get customers from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of customer party</returns>
        [Authorize]
        [HttpGet("{partyId}/{facilitatorId}/{systemUserGuid}/customers")]
        public async Task<ActionResult> GetSystemUserCustomers([FromRoute] int partyId, [FromRoute] Guid facilitatorId, [FromRoute] Guid systemUserGuid, CancellationToken cancellationToken)
        {
            List<AgentDelegationPartyFE> customers = await _systemUserAgentDelegationService.GetSystemUserCustomers(partyId, facilitatorId, systemUserGuid, cancellationToken);
            return Ok(customers);
        }

        /// <summary>
        /// Get agent delegations for this system user
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="facilitatorId">Facilitator uuid, uuid of partyId</param>
        /// <param name="systemUserGuid">System user id to get</param> 
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{facilitatorId}/{systemUserGuid}/delegation")]
        public async Task<ActionResult> GetSystemUserAgentDelegations([FromRoute] int partyId, [FromRoute] Guid facilitatorId, [FromRoute] Guid systemUserGuid, CancellationToken cancellationToken)
        {
            List<AgentDelegationFE> delegations = await _systemUserAgentDelegationService.GetSystemUserAgentDelegations(partyId, facilitatorId, systemUserGuid, cancellationToken);
            return Ok(delegations);
        }

        /// <summary>
        /// Add a customer as a new agent delegation to this systemuser
        /// </summary>
        /// <param name="partyId">Party id user represents</param>
        /// <param name="facilitatorId">Facilitator uuid, uuid of partyId</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="delegationRequest">Delegation request which contains partyUuid of party owning systemuser + customerId to add </param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{facilitatorId}/{systemUserGuid}/delegation/")]
        public async Task<ActionResult> AddClient([FromRoute] int partyId, [FromRoute] Guid facilitatorId, [FromRoute] Guid systemUserGuid, [FromBody] AgentDelegationRequest delegationRequest, CancellationToken cancellationToken)
        {
            Result<AgentDelegationFE> result = await _systemUserAgentDelegationService.AddClient(partyId, systemUserGuid, delegationRequest, cancellationToken);

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
        /// <param name="facilitatorId">Facilitator uuid, uuid of partyId</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="delegationId">Delegation id to remove from system user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpDelete("{partyId}/{facilitatorId}/{systemUserGuid}/delegation/{delegationId}")]
        public async Task<ActionResult> RemoveClient([FromRoute] int partyId, [FromRoute] Guid facilitatorId, [FromRoute] Guid systemUserGuid, [FromRoute] Guid delegationId, CancellationToken cancellationToken)
        {
            Result<bool> result = await _systemUserAgentDelegationService.RemoveClient(facilitatorId, delegationId, cancellationToken);

            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
        }
    }
}