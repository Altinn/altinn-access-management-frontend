using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class InstanceService : IInstanceService
    {
        private readonly IAuthenticationClient _authenticationClient;
        private readonly FeatureFlags _featureFlags;
        private readonly IDialogportClient _dialogportClient;
        private readonly IInstanceClient _instanceClient;
        private readonly ILogger<InstanceService> _logger;
        private readonly IResourceService _resourceService;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceService"/> class.
        /// </summary>
        /// <param name="authenticationClient">Client for fetching enriched end user tokens.</param>
        /// <param name="featureFlags">Feature flag configuration.</param>
        /// <param name="dialogportClient">Client for dialogporten lookups.</param>
        /// <param name="instanceClient">Client for instance delegation data.</param>
        /// <param name="logger">Logger instance.</param>
        /// <param name="resourceService">Service for resource data.</param>
        public InstanceService(
            IAuthenticationClient authenticationClient,
            IOptions<FeatureFlags> featureFlags,
            IDialogportClient dialogportClient,
            IInstanceClient instanceClient,
            ILogger<InstanceService> logger,
            IResourceService resourceService)
        {
            _authenticationClient = authenticationClient;
            _featureFlags = featureFlags.Value;
            _dialogportClient = dialogportClient;
            _instanceClient = instanceClient;
            _logger = logger;
            _resourceService = resourceService;
        }

        /// <inheritdoc />
        public async Task<List<InstanceDelegation>> GetDelegatedInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            bool shouldEnrichWithDialogporten = _featureFlags.EnableDialogportenDialogLookup;
            string enrichedToken = null;

            if (shouldEnrichWithDialogporten)
            {
                try
                {
                    enrichedToken = await _authenticationClient.GetPidEnrichedToken();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "InstanceService // GetDelegatedInstances // Failed to fetch enriched token for dialogporten lookup");
                    throw new ApplicationException("Failed to enrich token for dialogporten lookup", ex);
                }
            }

            List<InstancePermission> instancePermissions = await _instanceClient.GetDelegatedInstances(languageCode, party, from, to, resource, instance);

            var validPermissions = instancePermissions
                .Where(p => !string.IsNullOrEmpty(p.Resource?.RefId))
                .ToList();

            // Fan out all resource lookups in parallel instead of one-by-one
            ServiceResourceFE[] resources = await Task.WhenAll(
                validPermissions.Select(p => _resourceService.GetResource(p.Resource.RefId, languageCode)));

            // Pair each permission with its resolved resource, drop any where the lookup returned null
            List<InstanceDelegation> delegations = validPermissions
                .Zip(resources, (permission, resourceFe) => (permission, resourceFe))
                .Where(x => x.resourceFe != null)
                .Select(x => new InstanceDelegation(x.resourceFe, x.permission.Instance, x.permission.Permissions))
                .ToList();

            if (!shouldEnrichWithDialogporten || string.IsNullOrWhiteSpace(enrichedToken))
            {
                return delegations;
            }

            // Fan out all dialogporten lookups in parallel.
            // Each lookup is fire-and-assign; failures are logged but don't abort the others.
            await Task.WhenAll(delegations.Select(async d =>
            {
                if (string.IsNullOrWhiteSpace(d.Instance?.RefId))
                {
                    return;
                }

                try
                {
                    d.DialogLookup = await _dialogportClient.GetDialogLookupByInstanceRef(enrichedToken, languageCode, d.Instance.RefId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "InstanceService // GetDelegatedInstances // Dialog lookup failed for instanceRef {InstanceRef}", d.Instance.RefId);
                }
            }));

            return delegations;
        }

        /// <inheritdoc />
        public async Task<List<RightCheck>> DelegationCheck(Guid party, string resource, string instance)
        {
            ResourceCheckDto delegationCheckResult = await _instanceClient.GetDelegationCheck(party, resource, instance);
            if (delegationCheckResult == null || delegationCheckResult.Rights == null)
            {
                return new List<RightCheck>();
            }

            return delegationCheckResult.Rights.ToList();
        }

        /// <inheritdoc />
        public async Task<InstanceRights> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance)
        {
            return await _instanceClient.GetInstanceRights(languageCode, party, from, to, resource, instance);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> Delegate(Guid party, Guid? to, string resource, string instance, InstanceRightsDelegationDto input)
        {
            return await _instanceClient.CreateInstanceRightsAccess(party, to, resource, instance, input);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateInstanceAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            return await _instanceClient.UpdateInstanceRightsAccess(party, to, resource, instance, actionKeys);
        }

        /// <inheritdoc />
        public async Task<List<SimplifiedParty>> GetInstanceUsers(Guid party, string resource, string instance)
        {
            return await _instanceClient.GetInstanceUsers(party, resource, instance);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RemoveInstance(Guid party, Guid from, Guid to, string resource, string instance)
        {
            return await _instanceClient.RemoveInstance(party, from, to, resource, instance);
        }
    }
}
