using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utils for resources
    /// </summary>
    public static class ResourceUtils
    {
        /// <summary>
        /// Map a list of resources to frontend resource objects
        /// </summary>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="resources">List of resources to map to frontend resource objects</param>
        /// <param name="orgs">List resource owner organizations. Used to look up logo for resource owner</param>
        /// <returns>Output result</returns>
        public static List<ServiceResourceFE> MapToServiceResourcesFE(string languageCode, IEnumerable<ServiceResource> resources, OrgList orgs)
        {
            return resources.Select(resource => 
            {
                orgs.Orgs.TryGetValue(resource.HasCompetentAuthority.Orgcode.ToLower(), out var org);
                return new ServiceResourceFE(
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
            }).ToList();
        }

        /// <summary>
        /// Map a list of resources in access packages to frontend resource objects
        /// </summary>
        /// <param name="resources">List of resources to map to frontend resource objects</param>
        /// <returns>Output result</returns>
        public static List<AccessPackageResourceFE> MapToAccessPackageResourceFE(IEnumerable<ResourceAM> resources)
        {
            return resources.Select(resource =>
            {
                return new AccessPackageResourceFE()
                {
                    Identifier = resource.RefId,
                    Title = resource.Name,
                    Description = resource.Description,
                    ResourceOwnerName = resource.Provider.Name,
                    ResourceOwnerLogoUrl = resource.Provider.LogoUrl,
                    ResourceOwnerOrgcode = resource.Provider.Code,
                    ResourceType = resource.Type.Name
                };
            }).ToList();
        }

        /// <summary>
        /// Get resource ids from a list of rights
        /// </summary>
        /// <param name="rights">List of rights to get resource ids from</param>
        /// <returns>List of resource ids</returns>
        public static List<string> GetResourceIdsFromRights(IEnumerable<Right> rights)
        {
            List<string> matchIds = [];
            foreach (Right right in rights)
            {
                string matchId = right.Resource.Find(x => x.Id == "urn:altinn:resource")?.Value;
                if (matchId != null)
                {
                    matchIds.Add(matchId);
                }
            }

            return matchIds;
        }

        /// <summary>
        /// Get access package ids from a list of rights
        /// </summary>
        /// <param name="accessPackages">List of accessPackages to get access package ids from</param>
        /// <returns>List of access package ids</returns>
        public static List<string> GetAccessPackageIdsFromRights(IEnumerable<RegisteredSystemAccessPackage> accessPackages)
        {
            if (accessPackages == null) 
            {
                return [];
            }

            return accessPackages.Select(accessPackage => accessPackage.Urn).ToList();
        }
    }
}