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
        public async Task<List<OrganizationApiSet>> GetOfferedMaskinportenSchemaDelegations(string party, string languageCode)
        {
            List<MaskinportenSchemaDelegation> offeredDelegations = await _maskinportenSchemaClient.GetOfferedMaskinportenSchemaDelegations(party);
            return await BuildMaskinportenSchemaDelegationFE(offeredDelegations, languageCode, DelegationType.Offered);
        }

        /// <inheritdoc />
        public async Task<List<OrganizationApiSet>> GetReceivedMaskinportenSchemaDelegations(string party, string languageCode)
        {
            List<MaskinportenSchemaDelegation> receivedDelegations = await _maskinportenSchemaClient.GetReceivedMaskinportenSchemaDelegations(party);
            return await BuildMaskinportenSchemaDelegationFE(receivedDelegations, languageCode, DelegationType.Received);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeDelegationDTO delegationDTO)
        {
            return await _maskinportenSchemaClient.RevokeReceivedMaskinportenScopeDelegation(party, new RevokeReceivedDelegation(delegationDTO));
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeDelegationDTO delegationDTO)
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

                        delegationOutputs.Add(new ApiDelegationOutput()
                        {
                            OrgNumber = org,
                            ApiId = api,
                            Success = response.StatusCode == System.Net.HttpStatusCode.Created
                        });
                    }
                    catch
                    {
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

        /// <summary>
        /// Revoke a batch of Maskinporten scope delegations.
        /// </summary>
        /// <param name="party">The party identifier.</param>
        /// <param name="delegationDTOs">The list of delegation DTOs.</param>
        /// <param name="type">The type of delegation.</param>
        /// <returns>A list of tasks representing the HTTP response messages.</returns>
        public async Task<List<RevokeApiDelegationOutput>> BatchRevokeMaskinportenScopeDelegation(string party, List<RevokeDelegationDTO> delegationDTOs, DelegationType type)
        {
            var responses = new List<RevokeApiDelegationOutput>();

            if (type == DelegationType.Offered)
            {
                foreach (var delegation in delegationDTOs)
                {
                    try
                    {
                        var response = await _maskinportenSchemaClient.RevokeOfferedMaskinportenScopeDelegation(party, new RevokeOfferedDelegation(delegation));
                        responses.Add(new RevokeApiDelegationOutput
                        {
                            OrgNumber = delegation.OrgNumber,
                            ApiId = delegation.ApiId,
                            Success = response.IsSuccessStatusCode,
                        });
                    }
                    catch
                    {
                        responses.Add(new RevokeApiDelegationOutput
                        {
                            OrgNumber = delegation.OrgNumber,
                            ApiId = delegation.ApiId,
                            Success = false
                        });
                    }
                }
            }
            else
            {
                foreach (var delegation in delegationDTOs)
                {
                    try
                    {
                        var res = await _maskinportenSchemaClient.RevokeReceivedMaskinportenScopeDelegation(party, new RevokeReceivedDelegation(delegation));
                        responses.Add(new RevokeApiDelegationOutput
                        {
                            OrgNumber = delegation.OrgNumber,
                            ApiId = delegation.ApiId,
                            Success = res.IsSuccessStatusCode,
                        });
                    }
                    catch
                    {
                        responses.Add(new RevokeApiDelegationOutput
                        {
                            OrgNumber = delegation.OrgNumber,
                            ApiId = delegation.ApiId,
                            Success = false
                        });
                    }
                }
            }

            return responses;
        }

        /// <summary>
        /// Builds a list of organization API sets for Maskinporten schema delegations.
        /// </summary>
        /// <param name="delegations">List of Maskinporten schema delegations.</param>
        /// <param name="languageCode">Language code for localization.</param>
        /// <param name="type">Type of delegation (Offered or Covered).</param>
        /// <returns>A list of organization API sets.</returns>
        /// <remarks>
        /// This function processes a list of Maskinporten schema delegations and constructs a list of organization API sets.
        /// It first retrieves the resources associated with the delegations. For each delegation, it creates an 
        /// ApiListItem object with localized resource details. It then determines the organization name and number based 
        /// on the delegation type. The function groups the API items by organization and returns the list of organization 
        /// API sets.
        /// </remarks>
        private async Task<List<OrganizationApiSet>> BuildMaskinportenSchemaDelegationFE(List<MaskinportenSchemaDelegation> delegations, string languageCode, DelegationType type)
        {
            List<string> resourceIds = delegations.Select(d => d.ResourceId).ToList();
            List<ServiceResource> resources = await _resourceService.GetResources(resourceIds);

            List<OrganizationApiSet> overviewOrgList = new List<OrganizationApiSet>();

            foreach (MaskinportenSchemaDelegation delegation in delegations)
            {
                var resource = resources.Find(r => r.Identifier == delegation.ResourceId);
                if (resource == null)
                {
                    continue;
                }

                var api = new ApiListItem
                {
                    Id = delegation.ResourceId,
                    ApiName = resource.Title.GetValueOrDefault(languageCode),
                    Owner = resource.HasCompetentAuthority?.Name.GetValueOrDefault(languageCode),
                    Description = resource.RightDescription.GetValueOrDefault(languageCode),
                    Scopes = resource.ResourceReferences?.Where(r => r.ReferenceType.Equals("MaskinportenScope")).Select(r => r.Reference).ToList() ?? new List<string>()
                };

                // Determine the organization name and number based on the delegation type.
                // If the delegation type is 'Offered', use 'CoveredBy(...)'.
                // Otherwise, use 'OfferedBy(...)'.
                string delegationOrg = type == DelegationType.Offered ? delegation.CoveredByName : delegation.OfferedByName;
                string delegationOrgNumber = type == DelegationType.Offered ? delegation.CoveredByOrganizationNumber : delegation.OfferedByOrganizationNumber;

                var existingOrg = overviewOrgList.Find(org => org.Id == delegationOrg);
                if (existingOrg != null)
                {
                    existingOrg.ApiList.Add(api);
                }
                else
                {
                    var newOrg = new OrganizationApiSet
                    {
                        Id = delegationOrg,
                        Name = delegationOrg,
                        OrgNumber = delegationOrgNumber,
                        ApiList = new List<ApiListItem> { api }
                    };
                    overviewOrgList.Add(newOrg);
                }
            }

            return overviewOrgList;
        }
    }
}