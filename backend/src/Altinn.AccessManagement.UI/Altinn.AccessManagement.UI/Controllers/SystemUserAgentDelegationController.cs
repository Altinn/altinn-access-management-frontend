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
        /// Get all regnskapsforer customers for the party
        /// </summary>
        /// <param name="partyUuid">Party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of customer party</returns>
        [Authorize]
        [HttpGet("{partyUuid}/customers/regnskapsforer")]
        public async Task<ActionResult> GetPartyRegnskapsforerCustomers([FromRoute] Guid partyUuid, CancellationToken cancellationToken)
        {
            List<AgentDelegationPartyFE> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Regnskapsforer, cancellationToken);
            return Ok(customers);
        }

        /// <summary>
        /// Get all revisor customers for the party
        /// </summary>
        /// <param name="partyUuid">Party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of customer party</returns>
        [Authorize]
        [HttpGet("{partyUuid}/customers/revisor")]
        public async Task<ActionResult> GetPartyRevisorCustomers([FromRoute] Guid partyUuid, CancellationToken cancellationToken)
        {
            List<AgentDelegationPartyFE> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Revisor, cancellationToken);
            return Ok(customers);
        }

        /// <summary>
        /// Get all forretningsforer customers for the party
        /// </summary>
        /// <param name="partyUuid">Party user represents</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of customer party</returns>
        [Authorize]
        [HttpGet("{partyUuid}/customers/forretningsforer")]
        public async Task<ActionResult> GetPartyForretningsforerCustomers([FromRoute] Guid partyUuid, CancellationToken cancellationToken)
        {
            List<AgentDelegationPartyFE> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Forretningsforer, cancellationToken);
            return Ok(customers);
        }

        /// <summary>
        /// Get agent delegations for this system user
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to get</param> 
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{systemUserGuid}/delegation")]
        public async Task<ActionResult> GetSystemUserAgentDelegations([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, CancellationToken cancellationToken)
        {
            List<AgentDelegationFE> delegations = await _systemUserAgentDelegationService.GetSystemUserAgentDelegations(partyId, systemUserGuid, cancellationToken);
            return Ok(delegations);
        }

        /// <summary>
        /// Add a customer as a new agent delegation to this systemuser
        /// </summary>
        /// <param name="partyId">Party id user represents</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="delegationRequest">Delegation request which contains partyUuid of party owning systemuser + customerId to add </param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{systemUserGuid}/delegation/")]
        public async Task<ActionResult> AddClient([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromBody] AgentDelegationRequest delegationRequest, CancellationToken cancellationToken)
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
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="assignmentId">Assignment id to remove from system user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpDelete("{partyId}/{systemUserGuid}/delegation/{assignmentId}")]
        public async Task<ActionResult> RemoveClient([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromRoute] Guid assignmentId, CancellationToken cancellationToken)
        {
            Result<bool> result = await _systemUserAgentDelegationService.RemoveClient(partyId, systemUserGuid, assignmentId, cancellationToken);

            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
        }
    }
}