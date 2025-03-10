using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserClientAdministrationService : ISystemUserClientAdministrationService
    {
        private readonly ISystemUserClientAdministrationClient _systemUserClientAdministrationClient;
        private readonly IRegisterClientV2 _registerClientV2;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="systemUserClientAdministrationClient">The system user client administration client.</param>
        /// <param name="registerClientV2">The register client v2.</param>
        public SystemUserClientAdministrationService(
            ISystemUserClientAdministrationClient systemUserClientAdministrationClient,
            IRegisterClientV2 registerClientV2)
        {
            _systemUserClientAdministrationClient = systemUserClientAdministrationClient;
            _registerClientV2 = registerClientV2;
        }

        /// <inheritdoc />
        public async Task<Result<List<ClientPartyFE>>> GetPartyCustomers(Guid partyUuid, CustomerRoleType customerType, CancellationToken cancellationToken)
        {
            CustomerList regnskapsforerCustomers = await _registerClientV2.GetPartyCustomers(partyUuid, customerType, cancellationToken);
            return MapCustomerListToCustomerFE(regnskapsforerCustomers);
        }

        /// <inheritdoc />
        public async Task<Result<List<string>>> GetSystemUserClientDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            List<string> delegations = await _systemUserClientAdministrationClient.GetSystemUserClientDelegations(partyId, systemUserGuid, cancellationToken);
            return delegations;
        }
        
        /// <inheritdoc />
        public async Task<Result<bool>> AddClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return await _systemUserClientAdministrationClient.AddClient(partyId, systemUserGuid, customerPartyId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return await _systemUserClientAdministrationClient.RemoveClient(partyId, systemUserGuid, customerPartyId, cancellationToken);
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