using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Azure;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IAccessManagementClient _accessManagementClient;
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
        /// <param name="resourceService">The resource service.</param>
        /// <param name="resourceRegistryClient">The resource registry client.</param>
        public SingleRightService(IAccessManagementClient accessManagementClient, IResourceService resourceService, IResourceRegistryClient resourceRegistryClient)
        {
            _accessManagementClient = accessManagementClient;
            _resourceService = resourceService;
            _resourceRegistryClient = resourceRegistryClient;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CheckDelegationAccess(string partyId, Right request)
        {
            return await _accessManagementClient.CheckSingleRightsDelegationAccess(partyId, request);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            return await _accessManagementClient.CreateSingleRightsDelegation(party, delegation);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient)
        {
            return await _accessManagementClient.ClearAccessCacheOnRecipient(party, recipient);
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

            return delegationsFE;
        }

        /// <summary>
        /// Revokes a single right for a rightholder.
        /// </summary>
        /// <param name="party">The party ID.</param>
        /// <param name="delegationDTO">The delegation DTO.</param>
        /// <param name="delegationType">The type of delegation.</param>
        /// <returns>The task representing the asynchronous operation.</returns>
        public Task<HttpResponseMessage> RevokeSingleRightForRightholder(string party, RevokeSingleRightDelegationDTO delegationDTO, DelegationType delegationType)
        {
            var delegationObject = new DelegationInput
            {
                To = new List<IdValuePair> { new IdValuePair { Id = "urn:altinn:userId", Value = delegationDTO.UserId } },
                Rights = new List<Right>
                        {
                            new Right
                            {
                                Resource = new List<IdValuePair> { new IdValuePair { Id = "urn:altinn:resource", Value = delegationDTO.ResourceId } }
                            }
                        }
            };
            if (delegationType == DelegationType.Offered)
            {
                return _accessManagementClient.RevokeOfferedSingleRightsDelegation(party, delegationObject);
            }
            else
            {
                return _accessManagementClient.RevokeReceivedSingleRightsDelegation(party, delegationObject);
            }
        }
    }
}
