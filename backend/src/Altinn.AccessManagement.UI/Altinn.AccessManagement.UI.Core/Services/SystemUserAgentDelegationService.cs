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
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
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
        public async Task<Result<List<ClientPartyFE>>> GetPartyCustomers(Guid partyUuid, CustomerRoleType customerType, CancellationToken cancellationToken)
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
                PartyUuid = x.PartyUuid,
                PartyId = x.PartyId,
            }).ToList();
        }
        
        /// <inheritdoc />
        public async Task<Result<bool>> AddClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return await _systemUserAgentDelegationClient.AddClient(partyId, systemUserGuid, customerPartyId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return await _systemUserAgentDelegationClient.RemoveClient(partyId, systemUserGuid, customerPartyId, cancellationToken);
        }

        private static List<ClientPartyFE> MapCustomerListToCustomerFE(CustomerList customers)
        {
            return customers.Data.Select(x => 
            {
                return new ClientPartyFE()
                {
                    Id = x.PartyId,
                    Uuid = x.PartyUuid,
                    Name = x.DisplayName,
                    OrgNo = x.OrganizationIdentifier
                };
            }).ToList();
        }
    }
}