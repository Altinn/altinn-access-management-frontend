using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Microsoft.FeatureManagement;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Routes client delegation calls to <see cref="ClientDelegationClientV1"/> or
    /// <see cref="ClientDelegationClientV2"/> based on the
    /// <see cref="FeatureFlags.UseNewSingleRightsClientDelegation"/> feature flag.
    /// When v1 is retired, delete this class and <see cref="ClientDelegationClientV1"/>,
    /// and register <see cref="ClientDelegationClientV2"/> as the <see cref="IClientDelegationClient"/>.
    /// </summary>
    public class ClientDelegationClientSelector : IClientDelegationClient
    {
        private readonly ClientDelegationClientV1 _v1;
        private readonly ClientDelegationClientV2 _v2;
        private readonly IFeatureManager _featureManager;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientDelegationClientSelector"/> class.
        /// </summary>
        /// <param name="v1">The v1 client delegation client.</param>
        /// <param name="v2">The v2 client delegation client.</param>
        /// <param name="featureManager">Feature manager used to resolve which client to use.</param>
        public ClientDelegationClientSelector(ClientDelegationClientV1 v1, ClientDelegationClientV2 v2, IFeatureManager featureManager)
        {
            _v1 = v1;
            _v2 = v2;
            _featureManager = featureManager;
        }

        private async Task<IClientDelegationClient> ResolveClient()
        {
            return await _featureManager.IsEnabledAsync(FeatureFlags.UseNewSingleRightsClientDelegation) ? _v2 : _v1;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MyClientDelegation>> GetMyClients(List<Guid> provider = null, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).GetMyClients(provider, cancellationToken);

        /// <inheritdoc />
        public async Task RemoveMyClientProvider(Guid provider, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).RemoveMyClientProvider(provider, cancellationToken);

        /// <inheritdoc />
        public async Task RemoveMyClientAccessPackages(Guid provider, Guid from, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).RemoveMyClientAccessPackages(provider, from, payload, cancellationToken);

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetClients(Guid party, List<string> roles = null, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).GetClients(party, roles, cancellationToken);

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).GetAgents(party, cancellationToken);

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentAccessPackages(Guid party, Guid to, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).GetAgentAccessPackages(party, to, cancellationToken);

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientAccessPackages(Guid party, Guid from, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).GetClientAccessPackages(party, from, cancellationToken);

        /// <inheritdoc />
        public async Task<List<DelegationDto>> AddAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).AddAgentAccessPackages(party, from, to, payload, cancellationToken);

        /// <inheritdoc />
        public async Task RemoveAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).RemoveAgentAccessPackages(party, from, to, payload, cancellationToken);

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).AddAgent(party, to, personInput, cancellationToken);

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
            => await (await ResolveClient()).RemoveAgent(party, to, cancellationToken);
    }
}
