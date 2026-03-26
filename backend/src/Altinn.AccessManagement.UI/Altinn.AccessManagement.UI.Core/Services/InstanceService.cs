using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class InstanceService : IInstanceService
    {
        private readonly IInstanceClient _instanceClient;
        private readonly IResourceService _resourceService;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceService"/> class.
        /// </summary>
        /// <param name="instanceClient">Client for instance delegation data.</param>
        /// <param name="resourceService">Service for resource data.</param>
        public InstanceService(IInstanceClient instanceClient, IResourceService resourceService)
        {
            _instanceClient = instanceClient;
            _resourceService = resourceService;
        }

        /// <inheritdoc />
        public async Task<List<InstanceDelegation>> GetDelegatedInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            List<InstancePermission> instancePermissions = await _instanceClient.GetDelegatedInstances(languageCode, party, from, to, resource, instance);
            List<InstanceDelegation> result = new List<InstanceDelegation>();

            foreach (var instancePermission in instancePermissions)
            {
                string resourceId = instancePermission.Resource?.RefId;

                if (string.IsNullOrEmpty(resourceId))
                {
                    continue;
                }

                ServiceResourceFE resourceFe = await _resourceService.GetResource(resourceId, languageCode);

                if (resourceFe != null)
                {
                    result.Add(new InstanceDelegation(resourceFe, instancePermission.Instance, instancePermission.Permissions));
                }
            }

            return result;
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
