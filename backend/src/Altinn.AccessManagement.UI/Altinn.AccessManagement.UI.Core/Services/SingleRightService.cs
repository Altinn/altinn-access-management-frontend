using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SingleRightService : ISingleRightService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IResourceService _resourceService;

        JsonSerializerOptions options = new JsonSerializerOptions
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

            try
            {
                if (res.IsSuccessStatusCode)
                {
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

                    // string responseContent = JsonSerializer.Serialize(serviceResourceFE);
                    return serviceResourceFE;
                }
                else
                {
                    throw new Exception("Error while fetching single rights for rightholder");
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }

}
