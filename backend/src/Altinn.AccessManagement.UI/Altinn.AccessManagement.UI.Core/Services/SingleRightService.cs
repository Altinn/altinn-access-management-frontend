using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IResourceService _resourceService;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService" /> class.
        /// </summary>
        public SingleRightService(IAccessManagementClient accessManagementClient, IResourceService resourceService)
        {
            _accessManagementClient = accessManagementClient;
            _resourceService = resourceService;
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
        public async Task<List<ServiceResourceFE>> GetSingleRightsForRightholder(string languageCode, string party, string userId)
        {
            var res = await _accessManagementClient.GetSingleRightsForRightholder(party, userId);
            var results = await res.Content.ReadAsStringAsync();

            var delegationOutput = JsonSerializer.Deserialize<List<DelegationOutput>>(results, options);
            List<ServiceResourceFE> serviceResourceFE = new List<ServiceResourceFE>();
            foreach (var item in delegationOutput)
            {
                var resoureId = item.RightDelegationResults.FirstOrDefault().Resource.FirstOrDefault().Value;

                if (string.IsNullOrEmpty(resoureId))
                {
                    continue;
                }

                var resource = await _resourceService.GetResource(resoureId);

                serviceResourceFE.Add(new ServiceResourceFE(
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
                authorizationReference: resource.AuthorizationReference));
            }

            return serviceResourceFE;
        }

        /// <summary>
        /// Revokes a single right for a rightholder.
        /// </summary>
        /// <param name="party">The party ID.</param>
        /// <param name="delegationDTO">The delegation DTO.</param>
        /// <param name="type">The type of delegation.</param>
        /// <returns>The task representing the asynchronous operation.</returns>
        public Task<HttpResponseMessage> RevokeSingleRightForRightholder(string party, RevokeSingleRightDelegationDTO delegationDTO, DelegationType type)
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
            if (type == DelegationType.Offered)
            {
                return _accessManagementClient.RevokeOfferedSingleRightsDelegation(party, delegationObject);
            }
            else
            {
                return _accessManagementClient.RevokeRecievedSingleRightsDelegation(party, delegationObject);
            }
        }
    }
}
