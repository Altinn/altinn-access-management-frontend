using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IResourceService _resourceService;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly ISingleRightClient _singleRightClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService"/> class.
        /// </summary>
        /// <param name="resourceService">The resource service.</param>
        /// <param name="resourceRegistryClient">The resource registry client.</param>
        /// <param name="singleRightClient">The single rights client.</param>
        public SingleRightService(IResourceService resourceService, IResourceRegistryClient resourceRegistryClient, ISingleRightClient singleRightClient)
        {
            _resourceService = resourceService;
            _resourceRegistryClient = resourceRegistryClient;
            _singleRightClient = singleRightClient;
        }

        /// <inheritdoc />
        public async Task<List<RightCheck>> DelegationCheck(Guid from, string resource)
        {
            ResourceCheckDto delegationCheckResult = await _singleRightClient.GetDelegationCheck(from, resource);
            List<RightCheck> actions = delegationCheckResult.Rights.ToList();

            return actions;
        }

        /// <inheritdoc />
        public async Task<List<Models.SingleRight.Right>> GetResourceRightsMeta(string resource, string languageCode)
        {
            return await _resourceRegistryClient.GetResourceRights(resource, languageCode);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> Delegate(Guid party, Guid from, Guid to, string resource, List<string> actionKeys)
        {
            return await _singleRightClient.CreateSingleRightsAccess(party, to, from, resource, actionKeys);
        }

        /// <inheritdoc />
        public async Task<List<ResourceDelegation>> GetDelegatedResources(string languageCode, Guid party, Guid from, Guid? to)
        {
            List<ResourcePermission> resourcePermissions = await _singleRightClient.GetDelegatedResources(languageCode, party, from, to);

            List<ResourceDelegation> delegationsFE = new List<ResourceDelegation>();

            Dictionary<string, ServiceResourceFE> resources = await _resourceService.GetResourcesFE(
                resourcePermissions.Select(permission => permission.Resource?.RefId),
                languageCode);

            foreach (var resourcePermission in resourcePermissions)
            {
                var resourceId = resourcePermission.Resource?.RefId;

                if (!string.IsNullOrEmpty(resourceId) && resources.TryGetValue(resourceId, out ServiceResourceFE resourceFE))
                {
                    delegationsFE.Add(new ResourceDelegation(resourceFE, PermissionFE.FromPermissions(resourcePermission.Permissions)));
                }
            }

            return delegationsFE;
        }

        /// <inheritdoc />
        public async Task<ResourceRightFE> GetDelegatedResourceRights(string languageCode, Guid party, Guid from, Guid to, string resource)
        {
            ResourceRight resourceRight = await _singleRightClient.GetDelegatedResourceRights(languageCode, party, from, to, resource);
            return ResourceRightFE.FromResourceRight(resourceRight);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeResourceAccess(Guid party, Guid from, Guid to, string resourceId)
        {
            return await _singleRightClient.RevokeResourceDelegation(party, from, to, resourceId);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateResourceAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys)
        {
            return await _singleRightClient.UpdateSingleRightsAccess(party, to, from, resourceId, actionKeys);
        }
    }
}
