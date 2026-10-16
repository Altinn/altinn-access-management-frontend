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
        private readonly IClientDelegationClientResolver _clientDelegationClientResolver;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentDelegationService"/> class.
        /// </summary>
        /// <param name="systemUserAgentDelegationClient">The system user client administration client.</param>
        /// <param name="systemUserClient">The system user client</param>
        /// <param name="clientDelegationClientResolver">Resolves the client delegation client matching the feature flag.</param>
        public SystemUserAgentDelegationService(
            ISystemUserAgentDelegationClient systemUserAgentDelegationClient,
            ISystemUserClient systemUserClient,
            IClientDelegationClientResolver clientDelegationClientResolver)
        {
            _systemUserAgentDelegationClient = systemUserAgentDelegationClient;
            _systemUserClient = systemUserClient;
            _clientDelegationClientResolver = clientDelegationClientResolver;
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

            bool useV2 = false;
            if (useV2)
            {
                IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
                IEnumerable<Models.ClientDelegation.ClientDelegation> clients = await client.GetClients(partyUuid, null, cancellationToken);
                return clients.Select(x =>
                {
                    return new CustomerPartyFE()
                    {
                        Id = x.Client.Id,
                        Name = x.Client.Name,
                        OrgNo = x.Client.OrganizationIdentifier,
                        Type = x.Client.Type,
                        Variant = x.Client.Variant,
                        IsDeleted = x.Client.IsDeleted,
                        Access = x.Access.Select(y =>
                        {
                            return new ClientRoleAccessPackages()
                            {
                                Packages = y.Packages.Select(p => p.Urn).ToArray(),
                                Role = y.Role.Urn
                            };
                        }).ToList()
                    };
                }).ToList();
            } 
            else 
            {
                Result<List<Customer>> customers = await _systemUserClient.GetClients(partyId, partyUuid, accessPackages, cancellationToken);
                if (customers.IsProblem)
                {
                    return new Result<List<CustomerPartyFE>>(customers.Problem);
                }

                return MapCustomerListToCustomerFE(customers.Value);
            }
        }

        /// <inheritdoc />
        public async Task<Result<List<AgentDelegationFE>>> GetSystemUserAgentDelegations(int partyId, Guid systemUserGuid, Guid partyUuid, CancellationToken cancellationToken)
        {
            List<AgentDelegation> delegations = await _systemUserAgentDelegationClient.GetSystemUserAgentDelegations(partyId, partyUuid, systemUserGuid, cancellationToken);

            return delegations.Select(MapAgentDelegationToAgentDelegationFE).ToList();
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

            return MapAgentDelegationToAgentDelegationFE(addedDelegation);
        }

        /// <inheritdoc />
        public async Task<Result<bool>> RemoveClient(int partyId, Guid delegationId, Guid partyUuid, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            Result<bool> response = await _systemUserAgentDelegationClient.RemoveClient(partyId, systemUserGuid, partyUuid, delegationId, cancellationToken);
            if (response.IsProblem)
            {
                return new Result<bool>(response.Problem);
            }

            return response.Value;
        }
        
        /// <inheritdoc />
        public async Task<Result<bool>> AddSelf(int partyId, Guid systemUserGuid, Guid partyUuid, CancellationToken cancellationToken)
        {
            Result<bool> response = await _systemUserAgentDelegationClient.AddSelf(partyId, systemUserGuid, partyUuid, cancellationToken);
            if (response.IsProblem)
            {
                return new Result<bool>(response.Problem);
            }

            return response.Value;
        }
        
        /// <inheritdoc />
        public async Task<Result<bool>> RemoveSelf(int partyId, Guid systemUserGuid, Guid partyUuid, CancellationToken cancellationToken)
        {
            Result<bool> response = await _systemUserAgentDelegationClient.RemoveSelf(partyId, systemUserGuid, partyUuid, cancellationToken);
            if (response.IsProblem)
            {
                return new Result<bool>(response.Problem);
            }

            return response.Value;
        }

        /// <inheritdoc />
        public async Task<Result<bool>> IsSelfAdded(int partyId, Guid systemUserGuid, Guid partyUuid, CancellationToken cancellationToken)
        {
            Result<bool> response = await _systemUserAgentDelegationClient.IsSelfAdded(partyId, systemUserGuid, partyUuid, cancellationToken);
            if (response.IsProblem)
            {
                return new Result<bool>(response.Problem);
            }

            return response.Value;
        }

        private AgentDelegationFE MapAgentDelegationToAgentDelegationFE(AgentDelegation delegation)
        {
            return new AgentDelegationFE()
            {
                AgentSystemUserId = delegation.AgentSystemUserId,
                CustomerId = delegation.CustomerId,
                DelegationId = delegation.CustomerId
            };
        }

        private static List<CustomerPartyFE> MapCustomerListToCustomerFE(List<Customer> customers)
        {
            return customers.Select(x =>
            {
                return new CustomerPartyFE()
                {
                    Id = x.PartyUuid,
                    Name = x.DisplayName,
                    OrgNo = x.OrganizationIdentifier,
                    Variant = x.UnitType,
                    Type = "Organisasjon",
                    IsDeleted = x.IsDeleted,
                    Access = x.Access
                };
            }).ToList();
        }
    }
}