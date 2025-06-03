using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
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

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentDelegationService"/> class.
        /// </summary>
        /// <param name="systemUserAgentDelegationClient">The system user client administration client.</param>
        /// <param name="systemUserClient">The system user client</param>
        public SystemUserAgentDelegationService(
            ISystemUserAgentDelegationClient systemUserAgentDelegationClient,
            ISystemUserClient systemUserClient)
        {
            _systemUserAgentDelegationClient = systemUserAgentDelegationClient;
            _systemUserClient = systemUserClient;
        }
        
        /// <inheritdoc /> 
        public async Task<Result<List<CustomerPartyFE>>> GetSystemUserCustomers(int partyId, Guid systemUserGuid, Guid partyUuid, CancellationToken cancellationToken)
        {
            SystemUser systemUser = await _systemUserClient.GetAgentSystemUser(partyId, systemUserGuid, cancellationToken);
            if (systemUser is null) 
            {
                return new Result<List<CustomerPartyFE>>(Problem.SystemUserNotFound);
            }

            List<string> accessPackages = systemUser.AccessPackages.Select(x => x.Urn.Split(":").Last()).ToList();

            Result<List<Customer>> customers = await _systemUserClient.GetClients(partyId, partyUuid, accessPackages, cancellationToken);
            if (customers.IsProblem)
            {
                return new Result<List<CustomerPartyFE>>(customers.Problem);
            }

            return MapCustomerListToCustomerFE(customers.Value);
        }

        /// <inheritdoc />
        public async Task<Result<List<AgentDelegationFE>>> GetSystemUserAgentDelegations(int partyId, Guid systemUserGuid, Guid partyUuid, CancellationToken cancellationToken)
        {
            List<AgentDelegation> delegations = await _systemUserAgentDelegationClient.GetSystemUserAgentDelegations(partyId, partyUuid, systemUserGuid, cancellationToken);

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
        public async Task<Result<AgentDelegationFE>> AddClient(int partyId, Guid systemUserGuid, Guid partyUuid, AgentDelegationRequestFE delegationRequestFe, CancellationToken cancellationToken)
        {
            AgentDelegationRequest delegationRequest = new()
            {
                CustomerId = delegationRequestFe.CustomerId,
                Access = delegationRequestFe.Access,
                FacilitatorId = partyUuid
            };

            Result<List<AgentDelegation>> newAgentDelegations = await _systemUserAgentDelegationClient.AddClient(partyId, systemUserGuid, delegationRequest, cancellationToken);
            
            if (newAgentDelegations.IsProblem)
            {
                return new Result<AgentDelegationFE>(newAgentDelegations.Problem);
            }

            AgentDelegation addedDelegation = newAgentDelegations.Value.Find(delegation => delegation.CustomerId == delegationRequest.CustomerId);
            if (addedDelegation == null)
            {
                return Problem.CustomerIdNotFound;
            }

            return new AgentDelegationFE()
            {
                AgentSystemUserId = addedDelegation.AgentSystemUserId,
                CustomerId = addedDelegation.CustomerId,
                DelegationId = addedDelegation.DelegationId,
            };
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RemoveClient(int partyId, Guid delegationId, Guid partyUuid, CancellationToken cancellationToken)
        {
            Result<bool> response = await _systemUserAgentDelegationClient.RemoveClient(partyId, partyUuid, delegationId, cancellationToken);
            if (response.IsProblem)
            {
                return new Result<bool>(response.Problem);
            }

            return response.Value;
        }

        private static List<CustomerPartyFE> MapCustomerListToCustomerFE(List<Customer> customers)
        {
            return customers.Select(x => 
            {
                return new CustomerPartyFE()
                {
                    Id = x.PartyUuid,
                    Name = x.DisplayName,
                    OrgNo = x.OrganizationIdentifier
                };
            }).ToList();
        }
    }
}