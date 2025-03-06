using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserClientAdministrationService : ISystemUserClientAdministrationService
    {
        private readonly ISystemUserClientAdministrationClient _systemUserClientAdministrationClient;
        private readonly IAccessManagementClientV0 _accessManagementClientV0;
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClientV2 _registerClientV2;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserService"/> class.
        /// </summary>
        /// <param name="systemUserClientAdministrationClient">The system user client administration client.</param>
        /// <param name="accessManagementClient">The access management client.</param>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClientV2">The register client v2.</param>
        /// <param name="resourceHelper">Resources helper to enrich resources</param>
        public SystemUserClientAdministrationService(
            ISystemUserClientAdministrationClient systemUserClientAdministrationClient,
            IAccessManagementClientV0 accessManagementClient,
            ISystemRegisterClient systemRegisterClient,
            IRegisterClientV2 registerClientV2,
            ResourceHelper resourceHelper)
        {
            _systemUserClientAdministrationClient = systemUserClientAdministrationClient;
            _accessManagementClientV0 = accessManagementClient;
            _systemRegisterClient = systemRegisterClient;
            _registerClientV2 = registerClientV2;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<Result<List<ClientPartyFE>>> GetPartyRegnskapsforerCustomers(Guid partyUuid, CancellationToken cancellationToken)
        {
            CustomerList regnskapsforerCustomers = await _registerClientV2.GetPartyRegnskapsforerCustomers(partyUuid, cancellationToken);
            return MapCustomerListToCustomerFE(regnskapsforerCustomers);
        }

        /// <inheritdoc />
        public async Task<Result<List<ClientPartyFE>>> GetPartyRevisorCustomers(Guid partyUuid, CancellationToken cancellationToken)
        {
            CustomerList revisorCustomers = await _registerClientV2.GetPartyRevisorCustomers(partyUuid, cancellationToken);
            return MapCustomerListToCustomerFE(revisorCustomers);
        }

        private List<ClientPartyFE> MapCustomerListToCustomerFE(CustomerList customers)
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

        public async Task<Result<List<string>>> GetSystemUserClientDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            List<string> delegations = await _systemUserClientAdministrationClient.GetSystemUserClientDelegations(partyId, systemUserGuid, cancellationToken);
            return delegations;
        }

        public async Task<Result<bool>> AddClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return await _systemUserClientAdministrationClient.AddClient(partyId, systemUserGuid, customerPartyId, cancellationToken);
        }

        public async Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return await _systemUserClientAdministrationClient.RemoveClient(partyId, systemUserGuid, customerPartyId, cancellationToken);
        }
    }
}