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
        private readonly ISystemUserClient _systemUserClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentDelegationService"/> class.
        /// </summary>
        /// <param name="systemUserAgentDelegationClient">The system user client administration client.</param>
        /// <param name="systemUserClient">The system user client</param>
        /// <param name="registerClient">The register client</param>
        public SystemUserAgentDelegationService(
            ISystemUserAgentDelegationClient systemUserAgentDelegationClient,
            ISystemUserClient systemUserClient,
            IRegisterClient registerClient)
        {
            _systemUserAgentDelegationClient = systemUserAgentDelegationClient;
            _systemUserClient = systemUserClient;
            _registerClient = registerClient;
        }
        
        /// <inheritdoc /> 
        public async Task<List<AgentDelegationPartyFE>> GetSystemUserCustomers(int partyId, Guid partyUuid, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            // get access packages from systemuser
            SystemUser systemUser = await _systemUserClient.GetAgentSystemUser(partyId, systemUserGuid, cancellationToken);
            IEnumerable<string> accessPackageUrns = systemUser.AccessPackages.Select(x => x.Urn);
            CustomerRoleType customerType;

            List<string> regnskapsforerPackages = ["urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet", "urn:altinn:accesspackage:regnskapsforer-uten-signeringsrettighet", "urn:altinn:accesspackage:regnskapsforer-lonn"];
            List<string> revisorPackages = ["urn:altinn:accesspackage:ansvarlig-revisor", "urn:altinn:accesspackage:revisormedarbeider"];
            List<string> forretningsforerPackages = ["urn:altinn:accesspackage:skattegrunnlag"];
            
            if (accessPackageUrns.Any(x => regnskapsforerPackages.Contains(x))) 
            {
                customerType = CustomerRoleType.Regnskapsforer;
            } 
            else if (accessPackageUrns.Any(x => revisorPackages.Contains(x))) 
            {
                customerType = CustomerRoleType.Revisor;
            } 
            else if (accessPackageUrns.Any(x => forretningsforerPackages.Contains(x))) 
            {
                customerType = CustomerRoleType.Forretningsforer;
            } 
            else 
            {
                customerType = CustomerRoleType.None;
            }

            CustomerList customers = await _registerClient.GetPartyCustomers(partyUuid, customerType, cancellationToken);
            return MapCustomerListToCustomerFE(customers);
        }

        /// <inheritdoc />
        public async Task<List<AgentDelegationFE>> GetSystemUserAgentDelegations(int partyId, Guid facilitatorId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            List<AgentDelegation> delegations = await _systemUserAgentDelegationClient.GetSystemUserAgentDelegations(partyId, facilitatorId, systemUserGuid, cancellationToken);

            return delegations.Select(delegation => 
            {
                return new AgentDelegationFE()
                {
                    AgentSystemUserId = delegation.AgentSystemUserId,
                    CustomerId = delegation.CustomerId,
                    DelegationId = delegation.DelegationId,
                };
            }).ToList();
        }

        /// <inheritdoc />
        public async Task<Result<AgentDelegationFE>> AddClient(int partyId, Guid systemUserGuid, AgentDelegationRequest delegationRequest, CancellationToken cancellationToken)
        {
            Result<AgentDelegation> newAgentDelegation = await _systemUserAgentDelegationClient.AddClient(partyId, systemUserGuid, delegationRequest, cancellationToken);
            
            if (newAgentDelegation.IsProblem)
            {
                return new Result<AgentDelegationFE>(newAgentDelegation.Problem);
            }

            return new AgentDelegationFE()
            {
                AgentSystemUserId = newAgentDelegation.Value.AgentSystemUserId,
                CustomerId = newAgentDelegation.Value.CustomerId,
                DelegationId = newAgentDelegation.Value.DelegationId,
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RemoveClient(Guid facilitatorId, Guid delegationId, CancellationToken cancellationToken)
        {
            Result<bool> response = await _systemUserAgentDelegationClient.RemoveClient(facilitatorId, delegationId, cancellationToken);
            if (response.IsProblem)
            {
                return new Result<bool>(response.Problem);
            }

            return response.Value;
        }

        private static List<AgentDelegationPartyFE> MapCustomerListToCustomerFE(CustomerList customers)
        {
            return customers.Data.Select(x => 
            {
                return new AgentDelegationPartyFE()
                {
                    Id = x.PartyUuid,
                    Name = x.DisplayName,
                    OrgNo = x.OrganizationIdentifier
                };
            }).ToList();
        }
    }
}