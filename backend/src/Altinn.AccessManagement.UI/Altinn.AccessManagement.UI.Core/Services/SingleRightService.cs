using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IAccessManagementClientV0 _accessManagementClientV0;
        private readonly IResourceService _resourceService;
        private readonly IResourceRegistryClient _resourceRegistryClient;
        private readonly ISingleRightClient _singleRightClient;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService"/> class.
        /// </summary>
        /// <param name="accessManagementClient">The access management client.</param>
        /// <param name="accessManagementClientV0">The old access management client, used to access the old am endpoints.</param>
        /// <param name="resourceService">The resource service.</param>
        /// <param name="resourceRegistryClient">The resource registry client.</param>
        /// <param name="singleRightClient">The single rights client.</param>
        public SingleRightService(IAccessManagementClient accessManagementClient, IAccessManagementClientV0 accessManagementClientV0, IResourceService resourceService, IResourceRegistryClient resourceRegistryClient, ISingleRightClient singleRightClient)
        {
            _accessManagementClient = accessManagementClient;
            _accessManagementClientV0 = accessManagementClientV0;
            _resourceService = resourceService;
            _resourceRegistryClient = resourceRegistryClient;
            _singleRightClient = singleRightClient;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CheckDelegationAccess(string partyId, Right request)
        {
            return await _accessManagementClientV0.CheckSingleRightsDelegationAccess(partyId, request);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            return await _accessManagementClientV0.CreateSingleRightsDelegation(party, delegation);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient)
        {
            return await _accessManagementClientV0.ClearAccessCacheOnRecipient(party, recipient);
        }

        // ----------------------------
        //// New GUI
        // ----------------------------

        /// <inheritdoc />
        public async Task<List<ResourceAction>> DelegationCheck(Guid from, string resource)
        {
            ResourceCheckDto delegationCheckResult = await _singleRightClient.GetDelegationCheck(from, resource);
            List<ResourceAction> actions = delegationCheckResult.Actions.ToList();

            return actions;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> Delegate(Guid party, Guid from, Guid to, string resource, List<string> actionKeys)
        {
            return await _singleRightClient.CreateSingleRightsAccess(party, to, from, resource, actionKeys);
        }

        /// <inheritdoc />
        public async Task<List<ResourceDelegation>> GetSingleRightsForRightholder(string languageCode, string party, string userId)
        {
            var res = await _accessManagementClient.GetSingleRightsForRightholder(party, userId);
            var results = await res.Content.ReadAsStringAsync();

            var delegationOutputs = JsonSerializer.Deserialize<List<DelegationOutput>>(results, options);
            List<ResourceDelegation> delegationsFE = new List<ResourceDelegation>();

            // Create a Lookup to map orgnr to org details
            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();

            foreach (var delegation in delegationOutputs)
            {
                var firstRightDelegationResult = delegation.RightDelegationResults?.First();
                var firstResource = firstRightDelegationResult?.Resource?.First();
                var resourceId = firstResource?.Value;

                if (string.IsNullOrEmpty(resourceId))
                {
                    continue;
                }

                var resource = await _resourceService.GetResource(resourceId);

                if (resource != null)
                {
                    // Find the logo based on the orgnr in the orgnrToOrgLookup
                    orgList.Orgs.TryGetValue(resource.HasCompetentAuthority.Orgcode.ToLower(), out var org);

                    ServiceResourceFE resourceFE = new ServiceResourceFE(
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

                    delegationsFE.Add(new ResourceDelegation(resourceFE, delegation));
                }
            }

            return delegationsFE;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeResourceAccess(Guid from, Guid to, string resourceId)
        {
            return await _accessManagementClient.RevokeResourceDelegation(from, to, resourceId);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateResourceAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys)
        {
            return await _singleRightClient.UpdateSingleRightsAccess(party, to, from, resourceId, actionKeys);
        }
    }
}
