using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the client delegation API.
    /// </summary>
    public class ClientService : IClientService
    {
        private readonly IClientDelegationClient _clientDelegationClient;
        private readonly IClientDelegationResourceClient _clientDelegationResourceClient;
        private readonly IResourceService _resourceService;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientService"/> class.
        /// </summary>
        /// <param name="clientDelegationClient">Client delegation client.</param>
        /// <param name="clientDelegationResourceClient">Client delegation client for the v2 resource endpoints.</param>
        /// <param name="resourceService">Resource service, used to look up resource names.</param>
        /// <param name="logger">The logger.</param>
        public ClientService(
            IClientDelegationClient clientDelegationClient,
            IClientDelegationResourceClient clientDelegationResourceClient,
            IResourceService resourceService,
            ILogger<ClientService> logger)
        {
            _clientDelegationClient = clientDelegationClient;
            _clientDelegationResourceClient = clientDelegationResourceClient;
            _resourceService = resourceService;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MyClientDelegation>> GetMyClients(string languageCode, List<Guid> provider = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<MyClientDelegation> myClients = await _clientDelegationClient.GetMyClients(provider, cancellationToken);
            await EnrichResourceNames(myClients.SelectMany(myClient => myClient.Clients).SelectMany(client => client.Access), languageCode);
            return myClients;
        }

        /// <inheritdoc />
        public async Task RemoveMyClientProvider(Guid provider, CancellationToken cancellationToken = default)
        {
            await _clientDelegationClient.RemoveMyClientProvider(provider, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveMyClientAccessPackages(Guid provider, Guid from, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            await _clientDelegationClient.RemoveMyClientAccessPackages(provider, from, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetClients(Guid party, string languageCode, List<string> roles = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<ClientDelegation> clients = await _clientDelegationClient.GetClients(party, roles, cancellationToken);
            await EnrichResourceNames(clients.SelectMany(client => client.Access), languageCode);
            return clients;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetAgents(Guid party, string languageCode, CancellationToken cancellationToken = default)
        {
            IEnumerable<AgentDelegation> agents = await _clientDelegationClient.GetAgents(party, cancellationToken);
            await EnrichResourceNames(agents.SelectMany(agent => agent.Access), languageCode);
            return agents;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentAccessPackages(Guid party, Guid to, string languageCode, CancellationToken cancellationToken = default)
        {
            IEnumerable<ClientDelegation> clients = await _clientDelegationClient.GetAgentAccessPackages(party, to, cancellationToken);
            await EnrichResourceNames(clients.SelectMany(client => client.Access), languageCode);
            return clients;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientAccessPackages(Guid party, Guid from, string languageCode, CancellationToken cancellationToken = default)
        {
            IEnumerable<AgentDelegation> agents = await _clientDelegationClient.GetClientAccessPackages(party, from, cancellationToken);
            await EnrichResourceNames(agents.SelectMany(agent => agent.Access), languageCode);
            return agents;
        }

        /// <inheritdoc />
        public async Task<List<DelegationDto>> AddAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationClient.AddAgentAccessPackages(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            await _clientDelegationClient.RemoveAgentAccessPackages(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentResources(Guid party, Guid to, string languageCode, CancellationToken cancellationToken = default)
        {
            IEnumerable<ClientDelegation> clients = await _clientDelegationResourceClient.GetAgentResources(party, to, cancellationToken);
            await EnrichResourceNames(clients.SelectMany(client => client.Access), languageCode);
            return clients;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientResources(Guid party, Guid from, string languageCode, CancellationToken cancellationToken = default)
        {
            IEnumerable<AgentDelegation> agents = await _clientDelegationResourceClient.GetClientResources(party, from, cancellationToken);
            await EnrichResourceNames(agents.SelectMany(agent => agent.Access), languageCode);
            return agents;
        }

        /// <inheritdoc />
        public async Task<List<ResourceDelegationDto>> AddAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            return await _clientDelegationResourceClient.AddAgentResources(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            await _clientDelegationResourceClient.RemoveAgentResources(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveMyClientResources(Guid provider, Guid from, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            await _clientDelegationResourceClient.RemoveMyClientResources(provider, from, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            if (personInput != null)
            {
                if (string.IsNullOrWhiteSpace(personInput.PersonIdentifier) || string.IsNullOrWhiteSpace(personInput.LastName))
                {
                    throw new ArgumentException("PersonInput requires both personIdentifier and lastName.");
                }

                string personIdentifierCleaned = personInput.PersonIdentifier.Trim().Replace("\"", string.Empty);
                string lastnameCleaned = personInput.LastName.Trim().Replace("\"", string.Empty);

                if (string.IsNullOrWhiteSpace(personIdentifierCleaned) || string.IsNullOrWhiteSpace(lastnameCleaned))
                {
                    throw new ArgumentException("PersonInput requires both personIdentifier and lastName.");
                }

                if (!PersonIdentifierUtils.IsValidPersonIdentifier(personIdentifierCleaned))
                {
                    throw new ArgumentException("Invalid person identifier format");
                }

                PersonInput cleanedInput = new PersonInput
                {
                    LastName = lastnameCleaned,
                    PersonIdentifier = personIdentifierCleaned,
                };

                return await _clientDelegationClient.AddAgent(party, to, cleanedInput, cancellationToken);
            }

            return await _clientDelegationClient.AddAgent(party, to, null, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            await _clientDelegationClient.RemoveAgent(party, to, cancellationToken);
        }

        /// <summary>
        /// The v2 listings identify resources by registry id only, so the display name is looked up
        /// from the resource registry. Lookups are cached per registry id, and each id is only
        /// resolved once per response no matter how many roles it appears under.
        /// A registry failure leaves the names unset rather than failing the whole listing.
        /// </summary>
        private async Task EnrichResourceNames(IEnumerable<ClientDelegation.RoleAccessPackages> access, string languageCode)
        {
            List<CompactResource> resources = access
                .Where(roleAccess => roleAccess?.Resources != null)
                .SelectMany(roleAccess => roleAccess.Resources)
                .Where(resource => !string.IsNullOrEmpty(resource.RefId))
                .ToList();

            if (resources.Count == 0)
            {
                return;
            }

            List<string> refIds = resources.Select(resource => resource.RefId).Distinct().ToList();

            try
            {
                List<ServiceResource> registryResources = await _resourceService.GetResources(refIds);

                Dictionary<string, string> namesByRefId = refIds
                    .Zip(registryResources, (refId, registryResource) => (refId, registryResource))
                    .ToDictionary(
                        pair => pair.refId,
                        pair => pair.registryResource?.Title?.GetValueOrDefault(languageCode)
                            ?? pair.registryResource?.Title?.GetValueOrDefault("nb"));

                foreach (CompactResource resource in resources)
                {
                    resource.Name = namesByRefId.GetValueOrDefault(resource.RefId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ClientService.EnrichResourceNames failed to look up names for {Count} resources", refIds.Count);
            }
        }
    }
}
