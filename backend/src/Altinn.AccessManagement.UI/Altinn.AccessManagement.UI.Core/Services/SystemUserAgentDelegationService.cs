using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Authorization.ProblemDetails;
using Altinn.Platform.Register.Models;

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
        public async Task<Result<List<CustomerPartyFE>>> GetSystemUserCustomers(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            // get access packages from systemuser
            Party party = await _registerClient.GetPartyByPartyId(partyId);
            if (party == null || party.PartyUuid == null)
            {
                return Problem.Reportee_Orgno_NotFound;
            }

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

            CustomerList customers = await _registerClient.GetPartyCustomers((Guid)party.PartyUuid, customerType, cancellationToken);
            return MapCustomerListToCustomerFE(customers);
        }

        /// <inheritdoc />
        public async Task<Result<List<AgentDelegationFE>>> GetSystemUserAgentDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            Party party = await _registerClient.GetPartyByPartyId(partyId);
            if (party == null || party.PartyUuid == null)
            {
                return Problem.Reportee_Orgno_NotFound;
            }

            List<AgentDelegation> delegations = await _systemUserAgentDelegationClient.GetSystemUserAgentDelegations(partyId, (Guid)party.PartyUuid, systemUserGuid, cancellationToken);

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
        public async Task<Result<AgentDelegationFE>> AddClient(int partyId, Guid systemUserGuid, AgentDelegationRequestFE delegationRequestFe, CancellationToken cancellationToken)
        {
            Party party = await _registerClient.GetPartyByPartyId(partyId);
            if (party == null || party.PartyUuid == null)
            {
                return Problem.Reportee_Orgno_NotFound;
            }

            AgentDelegationRequest delegationRequest = new()
            {
                CustomerId = delegationRequestFe.CustomerId,
                FacilitatorId = (Guid)party.PartyUuid
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
        public async Task<Result<bool>> RemoveClient(int partyId, Guid delegationId, CancellationToken cancellationToken)
        {
            Party party = await _registerClient.GetPartyByPartyId(partyId);
            if (party == null || party.PartyUuid == null)
            {
                return Problem.Reportee_Orgno_NotFound;
            }

            Result<bool> response = await _systemUserAgentDelegationClient.RemoveClient(partyId, (Guid)party.PartyUuid, delegationId, cancellationToken);
            if (response.IsProblem)
            {
                return new Result<bool>(response.Problem);
            }

            return response.Value;
        }

        private static List<CustomerPartyFE> MapCustomerListToCustomerFE(CustomerList customers)
        {
            return customers.Data.Select(x => 
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