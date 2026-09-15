using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
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

            // Create a Lookup to map orgnr to org details
            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();

            // Resolve all resources concurrently (memory-cached per id) instead of one-by-one
            var lookups = (resourcePermissions ?? new List<ResourcePermission>())
                .Where(resourcePermission => !string.IsNullOrEmpty(resourcePermission.Resource?.RefId))
                .Select(async resourcePermission => new
                {
                    Permission = resourcePermission,
                    Resource = await _resourceService.GetResource(resourcePermission.Resource.RefId),
                });

            var results = await Task.WhenAll(lookups);

            return results
                .Where(result => result.Resource != null)
                .Select(result => new ResourceDelegation(MapToFrontend(result.Resource, languageCode, orgList), result.Permission.Permissions))
                .ToList();
        }

        /// <inheritdoc />
        public async Task<ResourceRight> GetDelegatedResourceRights(string languageCode, Guid party, Guid from, Guid to, string resource)
        {
            return await _singleRightClient.GetDelegatedResourceRights(languageCode, party, from, to, resource);
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

        private static ServiceResourceFE MapToFrontend(ServiceResource resource, string languageCode, OrgList orgList)
        {
            // Find the logo based on the orgnr in the orgnrToOrgLookup
            orgList.Orgs.TryGetValue(resource.HasCompetentAuthority?.Orgcode?.ToLower() ?? string.Empty, out Org org);

            return new ServiceResourceFE(
                resource.Identifier,
                resource.Title?.GetValueOrDefault(languageCode) ?? resource.Title?.GetValueOrDefault("nb"),
                resourceType: resource.ResourceType,
                status: resource.Status,
                resourceReferences: resource.ResourceReferences,
                resourceOwnerName: resource.HasCompetentAuthority?.Name?.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority?.Name?.GetValueOrDefault("nb"),
                resourceOwnerOrgNumber: resource.HasCompetentAuthority?.Organization,
                resourceOwnerOrgcode: resource.HasCompetentAuthority?.Orgcode,
                rightDescription: resource.RightDescription?.GetValueOrDefault(languageCode) ?? resource.RightDescription?.GetValueOrDefault("nb"),
                description: resource.Description?.GetValueOrDefault(languageCode) ?? resource.Description?.GetValueOrDefault("nb"),
                visible: resource.Visible,
                delegable: resource.Delegable,
                contactPoints: resource.ContactPoints,
                spatial: resource.Spatial,
                authorizationReference: resource.AuthorizationReference,
                resourceOwnerLogoUrl: org?.Logo);
        }
    }
}
