using Altinn.AMUI.Core.ClientInterfaces;
using Altinn.AMUI.Core.Helpers;
using Altinn.AMUI.Core.Models.AccessPackage.Frontend;
using Altinn.AMUI.Core.Models.Common;
using Altinn.AMUI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AMUI.Core.Models.SingleRight;
using Altinn.AMUI.Core.Models.SingleRight.Frontend;
using Altinn.AMUI.Core.Services.Interfaces;

namespace Altinn.AMUI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IResourceService _resourceService;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly ISingleRightClient _singleRightClient;
        private readonly IAltinnCdnService _altinnCdnService;

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService"/> class.
        /// </summary>
        /// <param name="resourceService">The resource service.</param>
        /// <param name="resourceRegistryClient">The resource registry client.</param>
        /// <param name="singleRightClient">The single rights client.</param>
        /// <param name="altinnCdnService">The Altinn CDN service, used to look up resource owner logos.</param>
        public SingleRightService(IResourceService resourceService, IResourceRegistryClient resourceRegistryClient, ISingleRightClient singleRightClient, IAltinnCdnService altinnCdnService)
        {
            _resourceService = resourceService;
            _resourceRegistryClient = resourceRegistryClient;
            _singleRightClient = singleRightClient;
            _altinnCdnService = altinnCdnService;
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
            if (resourceRight == null)
            {
                return null;
            }

            Dictionary<string, OrgData> orgs = await _altinnCdnService.GetOrgData();
            ServiceResourceFE resourceFE = resourceRight.Resource == null ? null : ResourceUtils.MapToServiceResourceFE(resourceRight.Resource, orgs);
            return ResourceRightFE.FromResourceRight(resourceRight, resourceFE);
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
