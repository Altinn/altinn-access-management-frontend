using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utils for resources
    /// </summary>
    public static class ResourceUtils
    {
        // Add your utility methods here

        /// <summary>
        /// Example utility method
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
    }
}