using Altinn.AccessManagement.UI.Core.Enums;
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
    [Route("accessmanagement/api/v1/systemuser/agentdelegation")]
    [ApiController]
    [AutoValidateAntiforgeryTokenIfAuthCookie]
    public class SystemUserAgentDelegationController : ControllerBase
    {
        private readonly ISystemUserAgentDelegationService _systemUserAgentDelegationService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Constructor for <see cref="SystemUserAgentDelegationController"/>
        /// </summary>
        public SystemUserAgentDelegationController(ISystemUserAgentDelegationService systemUserAgentDelegationService, IHttpContextAccessor httpContextAccessor)
        {
            _systemUserAgentDelegationService = systemUserAgentDelegationService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Used by the party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("{partyId}/{systemUserGuid}/delegation")]
        public async Task<ActionResult> GetSystemUserAgentDelegations([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, CancellationToken cancellationToken)
        {
            Result<List<AgentDelegationFE>> result = await _systemUserAgentDelegationService.GetSystemUserAgentDelegations(partyId, systemUserGuid, cancellationToken);
            return Ok(result.Value);
        }

        /// <summary>
        /// Used by the party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="customerPartyId">Customer to add to system user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("{partyId}/{systemUserGuid}/delegation/{customerPartyId}")]
        public async Task<ActionResult> AddClient([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromRoute] int customerPartyId, CancellationToken cancellationToken)
        {
            Result<bool> result = await _systemUserAgentDelegationService.AddClient(partyId, systemUserGuid, customerPartyId, cancellationToken);
            
            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
        }

        /// <summary>
        /// Used by the party
        /// </summary>
        /// <param name="partyId">Party user represents</param>
        /// <param name="systemUserGuid">System user id to get</param>
        /// <param name="customerPartyId">Customer to remove from system user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        [Authorize]
        [HttpDelete("{partyId}/{systemUserGuid}/delegation/{customerPartyId}")]
        public async Task<ActionResult> RemoveClient([FromRoute] int partyId, [FromRoute] Guid systemUserGuid, [FromRoute] int customerPartyId, CancellationToken cancellationToken)
        {
            Result<bool> result = await _systemUserAgentDelegationService.RemoveClient(partyId, systemUserGuid, customerPartyId, cancellationToken);

            if (result.IsProblem)
            {
                return result.Problem.ToActionResult();
            }

            return Ok(result.Value);
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
            Result<List<ClientPartyFE>> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Regnskapsforer, cancellationToken);
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
            Result<List<ClientPartyFE>> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Revisor, cancellationToken);
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
            Result<List<ClientPartyFE>> customers = await _systemUserAgentDelegationService.GetPartyCustomers(partyUuid, CustomerRoleType.Forretningsforer, cancellationToken);
            return Ok(customers.Value);
        }
    }
}