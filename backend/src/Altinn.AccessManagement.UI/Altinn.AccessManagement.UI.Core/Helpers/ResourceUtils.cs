using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utils for resources
    /// </summary>
    public static class ResourceUtils
    {
        /// <summary>
        /// Resolves the image used to represent a service owner.
        /// </summary>
        /// <remarks>
        /// The Altinn CDN org file is the single source for this. It carries a square emblem and a
        /// wide logo, and the UI renders the mark into square slots, so the emblem is preferred.
        /// Resources whose owner the CDN does not know get no image, and the UI falls back to an
        /// avatar with the owner's initials — that is a better outcome than an unvalidated url from
        /// somewhere else.
        /// </remarks>
        /// <param name="orgs">Organization data from the Altinn CDN, keyed by org code</param>
        /// <param name="orgCode">Org code of the service owner. May be null or unknown</param>
        /// <returns>The emblem, the logo if there is no emblem, or null</returns>
        public static string ResolveOwnerLogoUrl(IReadOnlyDictionary<string, Models.Common.OrgData> orgs, string orgCode)
        {
            if (orgs == null || string.IsNullOrWhiteSpace(orgCode))
            {
                return null;
            }

            if (!orgs.TryGetValue(orgCode.Trim(), out var org) || org == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(org.Emblem))
            {
                return org.Emblem;
            }

            return string.IsNullOrWhiteSpace(org.Logo) ? null : org.Logo;
        }

        /// <summary>
        /// Replaces the provider logo urls on resources that are passed through to the frontend as
        /// they arrive from Access Management, where the urls are user maintained and point anywhere.
        /// </summary>
        /// <param name="resources">Resources to resolve logos for. Modified in place</param>
        /// <param name="orgs">Organization data from the Altinn CDN</param>
        public static void ApplyOwnerLogos(IEnumerable<ResourceAM> resources, IReadOnlyDictionary<string, Models.Common.OrgData> orgs)
        {
            foreach (ResourceAM resource in resources ?? [])
            {
                if (resource?.Provider != null)
                {
                    resource.Provider.LogoUrl = ResolveOwnerLogoUrl(orgs, resource.Provider.Code);
                }
            }
        }

        /// <summary>
        /// Replaces the provider logo urls on the resources of every given access package.
        /// </summary>
        /// <param name="packages">Access packages whose resources to resolve logos for. Modified in place</param>
        /// <param name="orgs">Organization data from the Altinn CDN</param>
        public static void ApplyOwnerLogos(IEnumerable<AccessPackage> packages, IReadOnlyDictionary<string, Models.Common.OrgData> orgs)
        {
            foreach (AccessPackage package in packages ?? [])
            {
                ApplyOwnerLogos(package?.Resources, orgs);
            }
        }

        /// <summary>
        /// Map a list of resources to frontend resource objects
        /// </summary>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="resources">List of resources to map to frontend resource objects</param>
        /// <param name="orgs">List resource owner organizations. Used to look up logo for resource owner</param>
        /// <returns>Output result</returns>
        public static List<ServiceResourceFE> MapToServiceResourcesFE(string languageCode, IEnumerable<ServiceResource> resources, Dictionary<string, Models.Common.OrgData> orgs)
        {
            return resources.Select(resource =>
            {
                return new ServiceResourceFE(
                    resource.Identifier,
                    resource.Title?.GetValueOrDefault(languageCode) ?? resource.Title?.GetValueOrDefault("nb"),
                    resourceType: resource.ResourceType,
                    status: resource.Status,
                    resourceReferences: resource.ResourceReferences,
                    resourceOwnerOrgcode: resource.HasCompetentAuthority?.Orgcode,
                    resourceOwnerName: resource.HasCompetentAuthority?.Name?.GetValueOrDefault(languageCode) ?? resource.HasCompetentAuthority?.Name?.GetValueOrDefault("nb"),
                    resourceOwnerOrgNumber: resource.HasCompetentAuthority?.Organization,
                    rightDescription: resource.RightDescription?.GetValueOrDefault(languageCode) ?? resource.RightDescription?.GetValueOrDefault("nb"),
                    description: resource.Description?.GetValueOrDefault(languageCode) ?? resource.Description?.GetValueOrDefault("nb"),
                    visible: resource.Visible,
                    delegable: resource.Delegable,
                    contactPoints: resource.ContactPoints,
                    spatial: resource.Spatial,
                    authorizationReference: resource.AuthorizationReference,
                    resourceOwnerLogoUrl: ResolveOwnerLogoUrl(orgs, resource.HasCompetentAuthority?.Orgcode));
            }).ToList();
        }

        /// <summary>
        /// Map a list of resources in access packages to frontend resource objects
        /// </summary>
        /// <param name="resources">List of resources to map to frontend resource objects</param>
        /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
        /// <returns>Output result</returns>
        public static List<AccessPackageResourceFE> MapToAccessPackageResourceFE(IEnumerable<ResourceAM> resources, IReadOnlyDictionary<string, Models.Common.OrgData> orgs)
        {
            return resources.Select(resource =>
            {
                return new AccessPackageResourceFE()
                {
                    Identifier = resource.RefId,
                    Title = resource.Name,
                    Description = resource.Description,
                    ResourceOwnerName = resource.Provider?.Name,

                    // Provider.LogoUrl is deliberately ignored: the values are user maintained and
                    // point anywhere (image search results, wikimedia, dead CDN paths).
                    ResourceOwnerLogoUrl = ResolveOwnerLogoUrl(orgs, resource.Provider?.Code),
                    ResourceOwnerOrgcode = resource.Provider?.Code,
                    ResourceType = Enum.TryParse<ResourceType>(resource.Type?.Name, true, out var resourceType) ? resourceType : ResourceType.Default
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
