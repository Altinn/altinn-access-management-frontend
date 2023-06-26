using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the delegation client. Processes and maps the required data to the frontend model
    /// </summary>
    public class MaskinportenSchemaService : IMaskinportenSchemaService
    {
        private readonly IMaskinportenSchemaClient _delegationsClient;
        private readonly IResourceAdministrationPoint _resourceAdministrationPoint;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenSchemaService"/> class.
        /// </summary>
        /// <param name="delegationsClient">handler for delegations client</param>
        /// <param name="resourceAdministrationPoint">handler for resource registry</param>
        public MaskinportenSchemaService(
            IMaskinportenSchemaClient delegationsClient,
            IResourceAdministrationPoint resourceAdministrationPoint)
        {
            _delegationsClient = delegationsClient;
            _resourceAdministrationPoint = resourceAdministrationPoint;
        }

        /// <inheritdoc/>
        public async Task<List<MaskinportenSchemaDelegationFE>> GetOfferedMaskinportenSchemaDelegations(string party, string languageCode)
        {
            List<MaskinportenSchemaDelegation> offeredDelegations = await _delegationsClient.GetOfferedMaskinportenSchemaDelegations(party);
            return await BuildMaskinportenSchemaDelegationFE(offeredDelegations, languageCode);
        }

        /// <inheritdoc/>
        public async Task<List<MaskinportenSchemaDelegationFE>> GetReceivedMaskinportenSchemaDelegations(string party, string languageCode)
        {
            List<MaskinportenSchemaDelegation> receivedDelegations = await _delegationsClient.GetReceivedMaskinportenSchemaDelegations(party);
            return await BuildMaskinportenSchemaDelegationFE(receivedDelegations, languageCode);
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            return await _delegationsClient.RevokeReceivedMaskinportenScopeDelegation(party, delegation);
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation)
        {
            return await _delegationsClient.RevokeOfferedMaskinportenScopeDelegation(party, delegation);
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation)
        {
            return await _delegationsClient.CreateMaskinportenScopeDelegation(party, delegation);
        }

        private async Task<List<MaskinportenSchemaDelegationFE>> BuildMaskinportenSchemaDelegationFE(List<MaskinportenSchemaDelegation> delegations, string languageCode)
        {
            List<string> resourceIds = delegations.Select(d => d.ResourceId).ToList();
            List<ServiceResource> resources = await _resourceAdministrationPoint.GetRegistryResources(resourceIds);

            List<MaskinportenSchemaDelegationFE> result = new List<MaskinportenSchemaDelegationFE>();
            foreach (MaskinportenSchemaDelegation delegation in delegations)
            {
                MaskinportenSchemaDelegationFE delegationFE = new MaskinportenSchemaDelegationFE();
                delegationFE.LanguageCode = languageCode;
                delegationFE.OfferedByPartyId = delegation.OfferedByPartyId;
                delegationFE.OfferedByOrganizationNumber = delegation.OfferedByOrganizationNumber;
                delegationFE.OfferedByName = delegation.OfferedByName;
                delegationFE.CoveredByPartyId = delegation.CoveredByPartyId;
                delegationFE.CoveredByOrganizationNumber = delegation.CoveredByOrganizationNumber;
                delegationFE.CoveredByName = delegation.CoveredByName;
                delegationFE.PerformedByUserId = delegation.PerformedByUserId;
                delegationFE.Created = delegation.Created;
                delegationFE.ResourceId = delegation.ResourceId;
                ServiceResource resource = resources.FirstOrDefault(r => r.Identifier == delegation.ResourceId);
                if (resource != null)
                {
                    delegationFE.ResourceTitle = resource.Title.GetValueOrDefault(languageCode, "nb");
                    delegationFE.ResourceType = resource.ResourceType;
                    delegationFE.ResourceOwnerOrgcode = resource.HasCompetentAuthority.Orgcode;
                    delegationFE.ResourceOwnerOrgNumber = resource.HasCompetentAuthority.Organization;
                    delegationFE.ResourceOwnerName = resource.HasCompetentAuthority.Name.GetValueOrDefault(languageCode, "nb");
                    delegationFE.ResourceDescription = resource.Description.GetValueOrDefault(languageCode, "nb");
                    delegationFE.RightDescription = resource.RightDescription.GetValueOrDefault(languageCode, "nb");
                    delegationFE.ResourceReferences = resource.ResourceReferences;
                }

                result.Add(delegationFE);
            }

            return result;
        }
    }
}
