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
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="registerClient">The register client</param>
        public SystemUserAgentDelegationService(
            IRegisterClient registerClient)
        {
            _registerClient = registerClient;
        }

        /// <inheritdoc />
        public async Task<Result<List<ClientPartyFE>>> GetPartyCustomers(Guid partyUuid, CustomerRoleType customerType, CancellationToken cancellationToken)
        {
            CustomerList regnskapsforerCustomers = await _registerClient.GetPartyCustomers(partyUuid, customerType, cancellationToken);
            return MapCustomerListToCustomerFE(regnskapsforerCustomers);
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