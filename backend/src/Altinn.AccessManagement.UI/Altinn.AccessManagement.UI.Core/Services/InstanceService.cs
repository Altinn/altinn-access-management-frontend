using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class InstanceService : IInstanceService
    {
        private readonly IInstanceClient _instanceClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceService"/> class.
        /// </summary>
        /// <param name="instanceClient">Client for instance delegation data.</param>
        public InstanceService(IInstanceClient instanceClient)
        {
            _instanceClient = instanceClient;
        }

        /// <inheritdoc />
        public async Task<List<InstanceDelegation>> GetDelegatedInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            var delegatedInstances = await _instanceClient.GetDelegatedInstances(languageCode, party, from, to, resource, instance);
            
            return delegatedInstances
                .Select(instancePermission =>
                {
                    var instanceResource = instancePermission!.Resource;
                    var resourceId = instanceResource.RefId;

                    ResourceType resourceType = Enum.TryParse(instanceResource.Type?.Name, true, out ResourceType parsedResourceType)
                        ? parsedResourceType
                        : ResourceType.Default;

                    ServiceResourceFE resourceFe = new(
                        resourceId,
                        instanceResource.Name,
                        instanceResource.Description,
                        rightDescription: null,
                        status: null,
                        resourceOwnerName: instanceResource.Provider?.Name,
                        resourceOwnerOrgNumber: instanceResource.Provider?.RefId,
                        resourceReferences: null,
                        resourceType: resourceType,
                        contactPoints: null,
                        spatial: null,
                        authorizationReference: null,
                        resourceOwnerLogoUrl: instanceResource.Provider?.LogoUrl,
                        resourceOwnerOrgcode: instanceResource.Provider?.Code);

                    return new InstanceDelegation(resourceFe, instancePermission.Instance, instancePermission.Permissions);
                })
                .ToList();
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
