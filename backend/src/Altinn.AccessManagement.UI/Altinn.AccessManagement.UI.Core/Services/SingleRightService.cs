using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Register.Models;
using Azure;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IAccessManagementClientV0 _accessManagementClientV0;
        private readonly IResourceService _resourceService;
        private readonly IResourceRegistryClient _resourceRegistryClient;

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
        public SingleRightService(IAccessManagementClient accessManagementClient, IAccessManagementClientV0 accessManagementClientV0, IResourceService resourceService, IResourceRegistryClient resourceRegistryClient)
        {
            _accessManagementClient = accessManagementClient;
            _accessManagementClientV0 = accessManagementClientV0;
            _resourceService = resourceService;
            _resourceRegistryClient = resourceRegistryClient;
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
        public async Task<List<DelegationCheckedRightFE>> DelegationCheck(Guid party, string resource)
        {
            List<DelegationCheckedRight> delegationCheckResult = await _accessManagementClient.GetDelegationCheck(party, resource);
            List<DelegationCheckedRightFE> simplifiedResult = new List<DelegationCheckedRightFE>();
            
            foreach (DelegationCheckedRight right in delegationCheckResult)
            {
                simplifiedResult.Add(new DelegationCheckedRightFE
                {
                    Action = right.Action,
                    RightKey = right.RightKey,
                    Status = right.Status,
                    ReasonCodes = right.Details.Select(d => d.Code).ToList()
                });
            }

            return simplifiedResult;
        }

        /// <inheritdoc />
        public async Task<DelegationOutput> Delegate(Guid from, Guid to, string resource, List<string> rights)
        {
            return await _accessManagementClient.DelegateResource(from, to, resource, rights);
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
        public Task<HttpResponseMessage> RevokeResourceAccess(Guid from, Guid to, string resourceId)
        {
            return _accessManagementClient.RevokeResourceDelegation(from, to, resourceId);
        }

        /// <inheritdoc />
        public async Task<List<string>> EditResourceAccess(Guid from, Guid to, string resourceId, RightChanges update)
        {
            List<string> failedEdits = new List<string>();

            DelegationOutput delegationOutput = await _accessManagementClient.DelegateResource(from, to, resourceId, update.RightsToDelegate);

            var failingDelegations = delegationOutput.RightDelegationResults.Where(right => right.Status != "Delegated").Select(right => right.RightKey).ToList();

            if (failingDelegations != null && failingDelegations.Count > 0)
            {
                failedEdits.AddRange(failingDelegations);
            }

            foreach (string rightKey in update.RightsToRevoke)
            {
                var revokeResponse = await _accessManagementClient.RevokeRightDelegation(from, to, resourceId, rightKey);
                var revokeResult = await revokeResponse.Content.ReadAsStringAsync();

                bool deleted = JsonSerializer.Deserialize<bool>(revokeResult, options);

                if (!deleted)
                {
                    failedEdits.Add(rightKey);
                }
            }

            return failedEdits;
        }
    }
}
