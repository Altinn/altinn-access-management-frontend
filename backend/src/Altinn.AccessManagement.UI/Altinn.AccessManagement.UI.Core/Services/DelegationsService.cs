using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Profile.Models;
using Microsoft.Extensions.Logging;
using System.IO;

namespace Altinn.AccessManagement.UI.Core.Services
{
    public class DelegationsService : IDelegationsService
    {
        private readonly ILogger _logger;
        private readonly IDelegationsClient _delegationsClient;
        private readonly IResourceAdministrationPoint _resourceAdministrationPoint;
        private readonly IProfileClient _profileClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationsService"/> class.
        /// </summary>
        /// <param name="logger">handler for logger</param>
        /// <param name="delegationsClient">handler for delegations client</param>
        /// <param name="resourceAdministrationPoint">handler for resource registry</param>
        public DelegationsService(ILogger<IDelegationsService> logger,
            IDelegationsClient delegationsClient,
            IResourceAdministrationPoint resourceAdministrationPoint,
            IProfileClient profileClient)
        {
            _logger = logger;
            _delegationsClient = delegationsClient;
            _resourceAdministrationPoint = resourceAdministrationPoint;
            _profileClient = profileClient;
        }

        public async Task<List<DelegationsFE>> GetAllOutboundDelegationsAsync(string party)
        {
            List<Delegation> outboundDelegations = await _delegationsClient.GetOutboundDelegations(party);

            List<ServiceResource> resources = new List<ServiceResource>();
            List<Tuple<string, string>> resourceIds;
            resourceIds = outboundDelegations.Select(d => Tuple.Create(d.ResourceId, d.ResourceType.ToString())).ToList();

            resources = await _resourceAdministrationPoint.GetResources(resourceIds);
            string languageCode = await GetLanguageCodeForUser();
            List<DelegationsFE> delegations = new List<DelegationsFE>();
            foreach (Delegation delegation in outboundDelegations)
            {
                DelegationsFE delegationsFE = new DelegationsFE();
                delegationsFE.languageCode = languageCode;
                delegationsFE.CoveredByName = delegation.CoveredByName;
                delegationsFE.CoveredByOrganizationNumber = delegation.CoveredByOrganizationNumber;
                delegationsFE.CoveredByPartyId = delegation.CoveredByPartyId;
                delegationsFE.OfferedByPartyId = delegation.OfferedByPartyId;
                delegationsFE.PerformedByUserId = delegation.PerformedByUserId;
                delegationsFE.Created = delegation.Created;
                delegationsFE.ResourceId = delegation.ResourceId;
                ServiceResource resource = resources.Find(r => r.Identifier == delegation.ResourceId);
                delegationsFE.ResourceTitle = resource?.Title.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority.Name.GetValueOrDefault("nb");
                delegationsFE.ResourceType = resource.ResourceType;
                delegationsFE.Orgcode = resource.HasCompetentAuthority.Orgcode;
                delegationsFE.Organization = resource.HasCompetentAuthority.Organization;
                delegationsFE.Name = resource.HasCompetentAuthority.Name.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority.Name.GetValueOrDefault("nb");
                delegationsFE.Description = resource.Description.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority.Name.GetValueOrDefault("nb");
                delegationsFE.RightDescription = resource.RightDescription.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority.Name.GetValueOrDefault("nb");
                delegations.Add(delegationsFE);
            }

            return delegations;
        }

        public async Task<List<DelegationsFE>> GetAllInboundDelegationsAsync(string party)
        {
            List<Delegation> inboundDelegations = await _delegationsClient.GetInboundDelegations(party);
            string languageCode = await GetLanguageCodeForUser();
            List<ServiceResource> resources = new List<ServiceResource>();
            List<Tuple<string, string>> resourceIds;
            resourceIds = inboundDelegations.Select(d => Tuple.Create(d.ResourceId, d.ResourceType.ToString())).ToList();

            resources = await _resourceAdministrationPoint.GetResources(resourceIds);
            languageCode = languageCode ?? "nb-no";
            List<DelegationsFE> delegations = new List<DelegationsFE>();
            foreach (Delegation delegation in inboundDelegations)
            {
                DelegationsFE delegationsFE = new DelegationsFE();
                delegationsFE.languageCode = languageCode;
                delegationsFE.OfferedByName = delegation.OfferedByName;
                delegationsFE.OfferedByOrganizationNumber = delegation.OfferedByOrganizationNumber;
                delegationsFE.CoveredByPartyId = delegation.CoveredByPartyId;
                delegationsFE.OfferedByPartyId = delegation.OfferedByPartyId;
                delegationsFE.PerformedByUserId = delegation.PerformedByUserId;
                delegationsFE.Created = delegation.Created;
                delegationsFE.ResourceId = delegation.ResourceId;
                ServiceResource resource = resources.Find(r => r.Identifier == delegation.ResourceId);
                delegationsFE.ResourceTitle = resource?.Title.GetValueOrDefault(languageCode) ?? resource?.Title.GetValueOrDefault("nb");
                delegationsFE.ResourceType = resource.ResourceType;
                delegationsFE.Orgcode = resource.HasCompetentAuthority.Orgcode;
                delegationsFE.Organization = resource.HasCompetentAuthority.Organization;
                delegationsFE.Name = resource.HasCompetentAuthority.Name.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority.Name.GetValueOrDefault("nb");
                delegationsFE.Description = resource.Description.GetValueOrDefault(languageCode) ?? resource.Description.GetValueOrDefault("nb");
                delegationsFE.RightDescription = resource.RightDescription.GetValueOrDefault(languageCode) ?? resource.RightDescription.GetValueOrDefault("nb");
                delegations.Add(delegationsFE);
            }

            return delegations;
        }

        private async Task<string> GetLanguageCodeForUser()
        {
            UserProfile userProfile = await _profileClient.GetUserProfile();
            
            if (userProfile != null)
            {
                return userProfile.ProfileSettingPreference.Language;
            }
            else
            {
                return "nb";
            }
        }
    }
}
