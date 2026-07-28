using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the client delegation API.
    /// </summary>
    public class ClientService : IClientService
    {
        private readonly IClientDelegationClientResolver _clientDelegationClientResolver;
        private readonly IResourceService _resourceService;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientService"/> class.
        /// </summary>
        /// <param name="clientDelegationClientResolver">Resolves the client delegation client matching the feature flag.</param>
        /// <param name="resourceService">Resource service, used to look up resource names.</param>
        /// <param name="logger">The logger.</param>
        public ClientService(
            IClientDelegationClientResolver clientDelegationClientResolver,
            IResourceService resourceService,
            ILogger<ClientService> logger)
        {
            _clientDelegationClientResolver = clientDelegationClientResolver;
            _resourceService = resourceService;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MyClientDelegation>> GetMyClients(string languageCode, List<Guid> provider = null, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            IEnumerable<MyClientDelegation> myClients = await client.GetMyClients(provider, cancellationToken);
            await EnrichResources(myClients.SelectMany(myClient => myClient.Clients).SelectMany(delegation => delegation.Access), languageCode);
            return myClients;
        }

        /// <inheritdoc />
        public async Task RemoveMyClientProvider(Guid provider, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            await client.RemoveMyClientProvider(provider, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveMyClientAccessPackages(Guid provider, Guid from, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            await client.RemoveMyClientAccessPackages(provider, from, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetClients(Guid party, string languageCode, List<string> roles = null, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            IEnumerable<ClientDelegation> clients = await client.GetClients(party, roles, cancellationToken);
            await EnrichResources(clients.SelectMany(delegation => delegation.Access), languageCode);
            return clients;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetAgents(Guid party, string languageCode, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            IEnumerable<AgentDelegation> agents = await client.GetAgents(party, cancellationToken);
            await EnrichResources(agents.SelectMany(agent => agent.Access), languageCode);
            return agents;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentAccessPackages(Guid party, Guid to, string languageCode, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            IEnumerable<ClientDelegation> clients = await client.GetAgentAccessPackages(party, to, cancellationToken);
            await EnrichResources(clients.SelectMany(delegation => delegation.Access), languageCode);
            return clients;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientAccessPackages(Guid party, Guid from, string languageCode, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            IEnumerable<AgentDelegation> agents = await client.GetClientAccessPackages(party, from, cancellationToken);
            await EnrichResources(agents.SelectMany(agent => agent.Access), languageCode);
            return agents;
        }

        /// <inheritdoc />
        public async Task<List<DelegationDto>> AddAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            return await client.AddAgentAccessPackages(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            await client.RemoveAgentAccessPackages(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentResources(Guid party, Guid to, string languageCode, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            IEnumerable<ClientDelegation> clients = await client.GetAgentResources(party, to, cancellationToken);
            await EnrichResources(clients.SelectMany(delegation => delegation.Access), languageCode);
            return clients;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientResources(Guid party, Guid from, string languageCode, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            IEnumerable<AgentDelegation> agents = await client.GetClientResources(party, from, cancellationToken);
            await EnrichResources(agents.SelectMany(agent => agent.Access), languageCode);
            return agents;
        }

        /// <inheritdoc />
        public async Task<List<ResourceDelegationDto>> AddAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            return await client.AddAgentResources(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            await client.RemoveAgentResources(party, from, to, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveMyClientResources(Guid provider, Guid from, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            await client.RemoveMyClientResources(provider, from, payload, cancellationToken);
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

                IClientDelegationClient clientForPerson = await _clientDelegationClientResolver.Resolve();
                return await clientForPerson.AddAgent(party, to, cleanedInput, cancellationToken);
            }

            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            return await client.AddAgent(party, to, null, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            IClientDelegationClient client = await _clientDelegationClientResolver.Resolve();
            await client.RemoveAgent(party, to, cancellationToken);
        }

        /// <summary>
        /// The v2 listings identify resources by registry id only, so the resource itself is looked
        /// up from the resource registry and attached. That lets the frontend render both the list
        /// and the details dialog without a second round trip, using the same
        /// <see cref="ServiceResourceFE"/> shape the rest of the solution already renders.
        /// Each registry id is resolved once per response no matter how many roles it appears under,
        /// and lookups are cached across requests. A registry failure leaves the details unset
        /// rather than failing the whole listing.
        /// </summary>
        private async Task EnrichResources(IEnumerable<ClientDelegation.RoleAccessPackages> access, string languageCode)
        {
            List<IGrouping<string, CompactResource>> resourcesByRefId = access
                .Where(roleAccess => roleAccess?.Resources != null)
                .SelectMany(roleAccess => roleAccess.Resources)
                .Where(resource => !string.IsNullOrEmpty(resource.RefId))
                .GroupBy(resource => resource.RefId)
                .ToList();

            if (resourcesByRefId.Count == 0)
            {
                return;
            }

            foreach (IGrouping<string, CompactResource> sameResource in resourcesByRefId)
            {
                ServiceResourceFE details;

                try
                {
                    details = await _resourceService.GetResource(sameResource.Key, languageCode);
                }
                catch (Exception ex)
                {
                    // One unresolvable resource must not cost the remaining ones their details.
                    _logger.LogError(ex, "ClientService.EnrichResources failed to look up resource {RefId} from the resource registry", sameResource.Key);
                    continue;
                }

                foreach (CompactResource resource in sameResource)
                {
                    resource.Details = details;
                }
            }
        }
    }
}
