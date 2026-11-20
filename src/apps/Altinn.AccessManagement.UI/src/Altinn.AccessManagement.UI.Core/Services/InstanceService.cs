using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Dialogporten;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class InstanceService : IInstanceService
    {
        private readonly IAuthenticationClient _authenticationClient;
        private readonly IDialogportClient _dialogportClient;
        private readonly IInstanceClient _instanceClient;
        private readonly ILogger<InstanceService> _logger;
        private readonly IResourceService _resourceService;
        private readonly IAltinnCdnService _altinnCdnService;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceService"/> class.
        /// </summary>
        /// <param name="authenticationClient">Client for fetching enriched end user tokens.</param>
        /// <param name="dialogportClient">Client for dialogporten lookups.</param>
        /// <param name="instanceClient">Client for instance delegation data.</param>
        /// <param name="logger">Logger instance.</param>
        /// <param name="resourceService">Service for resource data.</param>
        /// <param name="altinnCdnService">Altinn CDN service, used to look up resource owner logos.</param>
        public InstanceService(
            IAuthenticationClient authenticationClient,
            IDialogportClient dialogportClient,
            IInstanceClient instanceClient,
            ILogger<InstanceService> logger,
            IResourceService resourceService,
            IAltinnCdnService altinnCdnService)
        {
            _authenticationClient = authenticationClient;
            _dialogportClient = dialogportClient;
            _instanceClient = instanceClient;
            _logger = logger;
            _resourceService = resourceService;
            _altinnCdnService = altinnCdnService;
        }

        /// <inheritdoc />
        public async Task<List<InstanceDelegation>> GetDelegatedInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            string enrichedToken;

            try
            {
                enrichedToken = await _authenticationClient.GetPidEnrichedToken();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "InstanceService // GetDelegatedInstances // Failed to fetch enriched token for dialogporten lookup");
                throw new ApplicationException("Failed to enrich token for dialogporten lookup", ex);
            }

            List<InstancePermission> instancePermissions = await _instanceClient.GetDelegatedInstances(languageCode, party, from, to, resource, instance);

            var validPermissions = instancePermissions
                .Where(p => !string.IsNullOrEmpty(p.Resource?.RefId))
                .ToList();

            // Many instances can share a resource, so each resource is looked up once. Resources that cannot be found are left out.
            Dictionary<string, ServiceResourceFE> resources = await _resourceService.GetResourcesFE(
                validPermissions.Select(p => p.Resource.RefId),
                languageCode);

            List<InstanceDelegation> delegations = validPermissions
                .Where(p => resources.ContainsKey(p.Resource.RefId))
                .Select(p => new InstanceDelegation(resources[p.Resource.RefId], p.Instance, PermissionFE.FromPermissions(p.Permissions)))
                .ToList();

            if (string.IsNullOrWhiteSpace(enrichedToken))
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
                catch (HttpStatusException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
                {
                    d.DialogLookup = new DialogLookup { Status = DialogLookupStatus.NotFound };
                }
                catch (HttpStatusException ex) when (ex.StatusCode == HttpStatusCode.Forbidden)
                {
                    d.DialogLookup = new DialogLookup { Status = DialogLookupStatus.Forbidden };
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
        public async Task<InstanceRightsFE> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance)
        {
            InstanceRights instanceRights = await _instanceClient.GetInstanceRights(languageCode, party, from, to, resource, instance);
            if (instanceRights == null)
            {
                return null;
            }

            Dictionary<string, OrgData> orgs = await _altinnCdnService.GetOrgData();
            ServiceResourceFE resourceFE = instanceRights.Resource == null ? null : ResourceUtils.MapToServiceResourceFE(instanceRights.Resource, orgs);
            return InstanceRightsFE.FromInstanceRights(instanceRights, resourceFE);
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
        public async Task<List<PartyFE>> GetInstanceUsers(Guid party, string resource, string instance)
        {
            List<SimplifiedParty> users = await _instanceClient.GetInstanceUsers(party, resource, instance);
            return users?.Select(PartyFE.FromSimplifiedParty).ToList();
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RemoveInstance(Guid party, Guid from, Guid to, string resource, string instance)
        {
            return await _instanceClient.RemoveInstance(party, from, to, resource, instance);
        }
    }
}
