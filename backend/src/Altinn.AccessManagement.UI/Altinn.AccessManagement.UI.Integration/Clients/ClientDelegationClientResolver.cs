using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Microsoft.FeatureManagement;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Picks <see cref="ClientDelegationClientV1"/> or <see cref="ClientDelegationClientV2"/> based on
    /// the <see cref="FeatureFlags.UseNewSingleRightsClientDelegation"/> feature flag.
    /// The flag is read per call, so flipping it in app configuration takes effect without a restart.
    /// When v1 is retired, delete this class together with <see cref="ClientDelegationClientV1"/>.
    /// </summary>
    public class ClientDelegationClientResolver : IClientDelegationClientResolver
    {
        private readonly ClientDelegationClientV1 _v1;
        private readonly ClientDelegationClientV2 _v2;
        private readonly IFeatureManager _featureManager;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientDelegationClientResolver"/> class.
        /// </summary>
        /// <param name="v1">The v1 client delegation client.</param>
        /// <param name="v2">The v2 client delegation client.</param>
        /// <param name="featureManager">Feature manager used to resolve which client to use.</param>
        public ClientDelegationClientResolver(ClientDelegationClientV1 v1, ClientDelegationClientV2 v2, IFeatureManager featureManager)
        {
            _v1 = v1;
            _v2 = v2;
            _featureManager = featureManager;
        }

        /// <inheritdoc />
        public async Task<IClientDelegationClient> Resolve()
        {
            return await _featureManager.IsEnabledAsync(FeatureFlags.UseNewSingleRightsClientDelegation) ? _v2 : _v1;
        }
    }
}
