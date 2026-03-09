using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class InstanceService : IInstanceService
    {
        private readonly IInstanceClient _instanceClient;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly IResourceService _resourceService;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceService"/> class.
        /// </summary>
        /// <param name="instanceClient">Client for instance delegation data.</param>
        /// <param name="resourceService">Service for resource registry lookups.</param>
        /// <param name="resourceRegistryClient">Client for resource owner metadata.</param>
        public InstanceService(IInstanceClient instanceClient, IResourceService resourceService, IResourceRegistryClient resourceRegistryClient)
        {
            _instanceClient = instanceClient;
            _resourceService = resourceService;
            _resourceRegistryClient = resourceRegistryClient;
        }

        /// <inheritdoc />
        public async Task<List<InstanceDelegation>> GetInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            List<InstancePermission> instancePermissions = await _instanceClient.GetInstances(languageCode, party, from, to, resource, instance);
            List<InstanceDelegation> delegations = new List<InstanceDelegation>();
            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();

            foreach (var instancePermission in instancePermissions)
            {
                var resourceId = instancePermission.Resource?.RefId;

                if (string.IsNullOrWhiteSpace(resourceId))
                {
                    continue;
                }

                var resourceDetails = await _resourceService.GetResource(resourceId);
                if (resourceDetails == null)
                {
                    continue;
                }

                orgList.Orgs.TryGetValue(resourceDetails.HasCompetentAuthority?.Orgcode?.ToLower() ?? string.Empty, out var org);

                ServiceResourceFE resourceFe = new ServiceResourceFE(
                    resourceDetails.Identifier,
                    resourceDetails.Title?.GetValueOrDefault(languageCode) ?? resourceDetails.Title?.GetValueOrDefault("nb"),
                    resourceType: resourceDetails.ResourceType,
                    status: resourceDetails.Status,
                    resourceReferences: resourceDetails.ResourceReferences,
                    resourceOwnerName: resourceDetails.HasCompetentAuthority?.Name?.GetValueOrDefault(languageCode) ?? resourceDetails.HasCompetentAuthority?.Name?.GetValueOrDefault("nb"),
                    resourceOwnerOrgNumber: resourceDetails.HasCompetentAuthority?.Organization,
                    resourceOwnerOrgcode: resourceDetails.HasCompetentAuthority?.Orgcode,
                    rightDescription: resourceDetails.RightDescription?.GetValueOrDefault(languageCode) ?? resourceDetails.RightDescription?.GetValueOrDefault("nb"),
                    description: resourceDetails.Description?.GetValueOrDefault(languageCode) ?? resourceDetails.Description?.GetValueOrDefault("nb"),
                    visible: resourceDetails.Visible,
                    delegable: resourceDetails.Delegable,
                    contactPoints: resourceDetails.ContactPoints,
                    spatial: resourceDetails.Spatial,
                    authorizationReference: resourceDetails.AuthorizationReference,
                    resourceOwnerLogoUrl: org?.Logo);

                delegations.Add(new InstanceDelegation(resourceFe, instancePermission.Instance, instancePermission.Permissions));
            }

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
        public async Task<InstanceRight> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance)
        {
            return await _instanceClient.GetInstanceRights(languageCode, party, from, to, resource, instance);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> Delegate(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            return await _instanceClient.CreateInstanceRightsAccess(party, to, resource, instance, actionKeys);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateInstanceAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            return await _instanceClient.UpdateInstanceRightsAccess(party, to, resource, instance, actionKeys);
        }
    }
}
