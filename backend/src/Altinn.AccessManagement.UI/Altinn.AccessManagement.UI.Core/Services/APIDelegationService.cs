using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    ///     Service that integrates with the delegation client. Processes and maps the required data to the frontend model
    /// </summary>
    public class APIDelegationService : IAPIDelegationService
    {
        private readonly IAccessManagementClient _maskinportenSchemaClient;
        private readonly IResourceService _resourceService;

        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        ///     Initializes a new instance of the <see cref="APIDelegationService" /> class.
        /// </summary>
        /// <param name="maskinportenSchemaClient">handler for delegations client</param>
        /// <param name="resourceService">handler for resource registry</param>
        public APIDelegationService(
            IAccessManagementClient maskinportenSchemaClient,
            IResourceService resourceService)
        {
            _maskinportenSchemaClient = maskinportenSchemaClient;
            _resourceService = resourceService;
        }

        /// <inheritdoc />
        public async Task<List<OverviewOrg>> GetOfferedMaskinportenSchemaDelegations(string party, string languageCode)
        {
            List<MaskinportenSchemaDelegation> offeredDelegations = await _maskinportenSchemaClient.GetOfferedMaskinportenSchemaDelegations(party);
            return await BuildMaskinportenSchemaDelegationFE(offeredDelegations, languageCode, LayoutState.Offered);
        }

        /// <inheritdoc />
        public async Task<List<OverviewOrg>> GetReceivedMaskinportenSchemaDelegations(string party, string languageCode)
        {
            List<MaskinportenSchemaDelegation> receivedDelegations = await _maskinportenSchemaClient.GetReceivedMaskinportenSchemaDelegations(party);
            return await BuildMaskinportenSchemaDelegationFE(receivedDelegations, languageCode, LayoutState.Received);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegationDTO delegationDTO)
        {
            return await _maskinportenSchemaClient.RevokeReceivedMaskinportenScopeDelegation(party, new RevokeReceivedDelegation(delegationDTO));
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegationDTO delegationDTO)
        {

            return await _maskinportenSchemaClient.RevokeOfferedMaskinportenScopeDelegation(party, new RevokeOfferedDelegation(delegationDTO));
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation)
        {
            return await _maskinportenSchemaClient.CreateMaskinportenScopeDelegation(party, delegation);
        }

        /// <inheritdoc />
        public async Task<List<ApiDelegationOutput>> BatchCreateMaskinportenScopeDelegation(string party, ApiDelegationInput delegation)
        {
            List<ApiDelegationOutput> delegationOutputs = new List<ApiDelegationOutput>();

            foreach (var org in delegation.OrgNumbers)
            {
                foreach (var api in delegation.ApiIdentifiers)
                {
                    var delegationObject = new DelegationInput
                    {
                        To = new List<IdValuePair> { new IdValuePair { Id = "urn:altinn:organizationnumber", Value = org } },
                        Rights = new List<Right>
                        {
                            new Right
                            {
                                Resource = new List<IdValuePair> { new IdValuePair { Id = "urn:altinn:resource", Value = api } }
                            }
                        }
                    };
                    try
                    {
                        var response = await _maskinportenSchemaClient.CreateMaskinportenScopeDelegation(party, delegationObject);
                        string responseContent = await response.Content.ReadAsStringAsync();

                        delegationOutputs.Add(new ApiDelegationOutput()
                        {
                            OrgNumber = org,
                            ApiId = api,
                            Success = response.StatusCode == System.Net.HttpStatusCode.Created
                        });
                    }
                    catch (Exception e)
                    {
                        System.Diagnostics.Debug.WriteLine(e.Message);
                        delegationOutputs.Add(new ApiDelegationOutput()
                        {
                            OrgNumber = org,
                            ApiId = api,
                            Success = false,
                        });
                    }
                }
            }

            return delegationOutputs;
        }

        /// <inheritdoc />
        public async Task<List<DelegationResponseData>> DelegationCheck(string partyId, Right request)
        {
            return await _maskinportenSchemaClient.MaskinportenSchemaDelegationCheck(partyId, request);
        }

        private async Task<List<OverviewOrg>> BuildMaskinportenSchemaDelegationFE(List<MaskinportenSchemaDelegation> delegations, string languageCode, LayoutState layout)
        {
            List<string> resourceIds = delegations.Select(d => d.ResourceId).ToList();
            List<ServiceResource> resources = await _resourceService.GetResources(resourceIds);
        
            List<OverviewOrg> overviewOrgList = new List<OverviewOrg>();
        
            foreach (MaskinportenSchemaDelegation delegation in delegations)
            {
                var resource = resources.FirstOrDefault(r => r.Identifier == delegation.ResourceId);
                if (resource == null)
                {
                    continue;
                }

                var delegationFE = new MaskinportenSchemaDelegationFE
                {
                    LanguageCode = languageCode,
                    OfferedByPartyId = delegation.OfferedByPartyId,
                    OfferedByOrganizationNumber = delegation.OfferedByOrganizationNumber,
                    OfferedByName = delegation.OfferedByName,
                    CoveredByPartyId = delegation.CoveredByPartyId,
                    CoveredByOrganizationNumber = delegation.CoveredByOrganizationNumber,
                    CoveredByName = delegation.CoveredByName,
                    PerformedByUserId = delegation.PerformedByUserId,
                    Created = delegation.Created,
                    ResourceId = delegation.ResourceId,
                    ResourceTitle = resource.Title.GetValueOrDefault(languageCode, "nb"),
                    ResourceType = resource.ResourceType,
                    ResourceOwnerName = resource.HasCompetentAuthority?.Name.GetValueOrDefault(languageCode, "nb"),
                    RightDescription = resource.RightDescription.GetValueOrDefault(languageCode, "nb"),
                    ResourceReferences = resource.ResourceReferences
                };
        
                var api = new ApiListItem
                {
                    Id = delegationFE.ResourceId,
                    ApiName = delegationFE.ResourceTitle,
                    Owner = delegationFE.ResourceOwnerName,
                    Description = delegationFE.RightDescription,
                    Scopes = delegationFE.ResourceReferences?.Where(r => r.ReferenceType.Equals("MaskinportenScope")).Select(r => r.Reference).ToList() ?? new List<string>()
                };
        
                string delegationOrg = layout == LayoutState.Offered ? delegationFE.CoveredByName : delegationFE.OfferedByName;
                string delegationOrgNumber = layout == LayoutState.Offered ? delegationFE.CoveredByOrganizationNumber : delegationFE.OfferedByOrganizationNumber;
        
                var existingOrg = overviewOrgList.Find(org => org.Id == delegationOrg);
                if (existingOrg != null)
                {
                    existingOrg.ApiList.Add(api);
                }
                else
                {
                    var newOrg = new OverviewOrg
                    {
                        Id = delegationOrg,
                        Name = delegationOrg,
                        OrgNumber = delegationOrgNumber,
                        IsAllSoftDeleted = false,
                        ApiList = new List<ApiListItem> { api }
                    };
                    overviewOrgList.Add(newOrg);
                }
            }
        
            return overviewOrgList;
        }
    }

    /// <summary>
    /// Represents an API item.
    /// </summary>
    public class ApiListItem
    {
        /// <summary>
        /// Gets or sets the ID of the API.
        /// </summary>
        public string Id { get; set; }
    
        /// <summary>
        /// Gets or sets the name of the API.
        /// </summary>
        public string ApiName { get; set; }
    
        /// <summary>
        /// Gets or sets the owner of the API.
        /// </summary>
        public string Owner { get; set; }
    
        /// <summary>
        /// Gets or sets the description of the API.
        /// </summary>
        public string Description { get; set; }
    
        /// <summary>
        /// Gets or sets the scopes of the API.
        /// </summary>
        public List<string> Scopes { get; set; } = new List<string>();
    }

    /// <summary>
    /// Represents an overview organization.
    /// </summary>
    public class OverviewOrg
    {
        /// <summary>
        /// Gets or sets the ID of the organization.
        /// </summary>
        public string Id { get; set; }
    
        /// <summary>
        /// Gets or sets the name of the organization.
        /// </summary>
        public string Name { get; set; }
    
        /// <summary>
        /// Gets or sets the organization number.
        /// </summary>
        public string OrgNumber { get; set; }
    
        /// <summary>
        /// Gets or sets a value indicating whether all items in the organization are soft deleted.
        /// </summary>
        public bool IsAllSoftDeleted { get; set; }
    
        /// <summary>
        /// Gets or sets the list of API items in the organization.
        /// </summary>
        public List<ApiListItem> ApiList { get; set; } = new List<ApiListItem>();
    }

    /// <summary>
    /// Represents the layout state.
    /// </summary>
    public enum LayoutState
    {
        /// <summary>
        /// Offered layout state.
        /// </summary>
        Offered,
    
        /// <summary>
        /// Received layout state.
        /// </summary>
        Received
    }
}
