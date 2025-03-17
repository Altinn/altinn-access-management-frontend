using Altinn.AccessManagement.UI.Core.Enums;
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
            Result<List<AgentDelegationPartyFE>> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Regnskapsforer, cancellationToken);
            return Ok(customers.Value);
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
            Result<List<AgentDelegationPartyFE>> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Revisor, cancellationToken);
            return Ok(customers.Value);
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
            Result<List<AgentDelegationPartyFE>> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Forretningsforer, cancellationToken);
            return Ok(customers.Value);
        }
    }
}