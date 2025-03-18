using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserAgentDelegationService : ISystemUserAgentDelegationService
    {
        private readonly ISystemUserAgentDelegationClient _systemUserAgentDelegationClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentDelegationService"/> class.
        /// </summary>
        /// <param name="systemUserAgentDelegationClient">The system user client administration client.</param>
        /// <param name="registerClient">The register client</param>
        public SystemUserAgentDelegationService(
            ISystemUserAgentDelegationClient systemUserAgentDelegationClient,
            IRegisterClient registerClient)
        {
            _systemUserAgentDelegationClient = systemUserAgentDelegationClient;
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<Result<List<AgentDelegationPartyFE>>> GetPartyCustomers(Guid partyUuid, CustomerRoleType customerType, CancellationToken cancellationToken)
        {
            CustomerList regnskapsforerCustomers = await _registerClient.GetPartyCustomers(partyUuid, customerType, cancellationToken);
            return MapCustomerListToCustomerFE(regnskapsforerCustomers);
        }

        /// <inheritdoc />
        public async Task<Result<List<AgentDelegationFE>>> GetSystemUserAgentDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            List<AgentDelegation> delegations = await _systemUserAgentDelegationClient.GetSystemUserAgentDelegations(partyId, systemUserGuid, cancellationToken);
            return delegations.Select(x => new AgentDelegationFE()
            {
                AssignmentId = x.Id,
                CustomerUuid = x.From.Id,
            }).ToList();
        }

        /// <inheritdoc />
        public async Task<Result<AgentDelegationFE>> AddClient(int partyId, Guid systemUserGuid, AgentDelegationRequest delegationRequest, CancellationToken cancellationToken)
        {
            Result<AgentDelegation> newAgentDelegation = await _systemUserAgentDelegationClient.AddClient(partyId, systemUserGuid, delegationRequest, cancellationToken);
            return new AgentDelegationFE()
            {
                AssignmentId = newAgentDelegation.Value.Id,
                CustomerUuid = newAgentDelegation.Value.From.Id,
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, Guid assignmentId, CancellationToken cancellationToken)
        {
            return await _systemUserAgentDelegationClient.RemoveClient(partyId, systemUserGuid, assignmentId, cancellationToken);
        }

        private static List<AgentDelegationPartyFE> MapCustomerListToCustomerFE(CustomerList customers)
        {
            return customers.Data.Select(x => 
            {
                return new AgentDelegationPartyFE()
                {
                    Uuid = x.PartyUuid,
                    Name = x.DisplayName,
                    OrgNo = x.OrganizationIdentifier
                };
            }).ToList();
        }
    }
}