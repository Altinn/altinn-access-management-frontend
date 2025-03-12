using System.Collections.Generic;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class AccessPackageService : IAccessPackageService
    {
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IAccessPackageClient _accessPackageClient;
        private readonly ILookupService _lookupService;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightService"/> class.
        /// </summary>
        /// <param name="accessManagementClient">The access management client.</param>
        /// <param name="accessPackageClient">The access package client.</param>
        /// <param name="lookupService">The lookup service.</param>
        public AccessPackageService(IAccessManagementClient accessManagementClient, IAccessPackageClient accessPackageClient, ILookupService lookupService)
        {
            _accessManagementClient = accessManagementClient;
            _accessPackageClient = accessPackageClient;
            _lookupService = lookupService;
        }

        /// <inheritdoc />
        public async Task<List<AccessAreaFE>> GetSearch(string languageCode, string searchString)
        {
            IEnumerable<SearchObject<AccessPackage>> searchMatches = await _accessPackageClient.GetAccessPackageSearchMatches(languageCode, searchString);

            List<AccessAreaFE> sortedAreas = new List<AccessAreaFE>();

            foreach (SearchObject<AccessPackage> searchMatch in searchMatches)
            {
                int premadeAreaIndex = sortedAreas.FindIndex(area => area.Id == searchMatch.Object.Area.Id);

                if (premadeAreaIndex < 0)
                {
                    sortedAreas.Add(new AccessAreaFE(searchMatch.Object.Area, new List<AccessPackage> { searchMatch.Object }));
                }
                else
                {
                    sortedAreas[premadeAreaIndex].AccessPackages.Add(searchMatch.Object);
                }
            }

            return sortedAreas;
        }

        /// <inheritdoc/>
        public async Task<Dictionary<string, List<AccessPackageDelegation>>> GetDelegationsToRightHolder(Guid rightHolderUuid, Guid rightOwnerUuid, string languageCode)
        {
            List<AccessPackageAccess> accessesFromAM = await _accessManagementClient.GetAccessPackageAccesses(rightHolderUuid.ToString(), rightOwnerUuid.ToString(), languageCode);

            Dictionary<string, List<AccessPackageDelegation>> sortedAccesses = new Dictionary<string, List<AccessPackageDelegation>>();
            
            foreach (AccessPackageAccess access in accessesFromAM)
            {
                var isInherited = access.AccessDetails.DelegatedTo != rightHolderUuid; 
                AccessPackageDelegation delegation = new AccessPackageDelegation(access.AccessPackage.Id.ToString(), access.AccessDetails, isInherited, null);
                if (isInherited)
                {
                    var inheritedFrom = await _lookupService.GetPartyByUUID(access.AccessDetails.DelegatedTo);
                    delegation.InheritedFrom = inheritedFrom;
                }
                
                if (!sortedAccesses.ContainsKey(access.AccessPackage.Area.Id))
                {
                    sortedAccesses.Add(access.AccessPackage.Area.Id, new List<AccessPackageDelegation> { delegation });
                }
                else
                {
                    sortedAccesses[access.AccessPackage.Area.Id].Add(delegation);
                }
            }

            return sortedAccesses;
        }

        /// <inheritdoc />
        public Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, string packageId)
        {
            return _accessManagementClient.RevokeAccessPackage(from, to, packageId);
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> CreateDelegation(string party, Guid to, string packageId, string languageCode)
        {
            return await _accessManagementClient.CreateAccessPackageDelegation(party, to, packageId, languageCode);
        }
    }
}
