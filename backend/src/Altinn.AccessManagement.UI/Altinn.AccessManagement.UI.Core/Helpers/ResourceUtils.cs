using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
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
        /// Resolves the service owner's mark from CDN org data: the emblem if present, otherwise the logo.
        /// </summary>
        /// <param name="orgs">CDN org data, keyed by org code</param>
        /// <param name="orgCode">Org code of the service owner. Matched case-insensitively.</param>
        /// <returns>The emblem or logo url, or null when the org is unknown or has neither</returns>
        public static string ResolveOwnerLogoUrl(IReadOnlyDictionary<string, OrgData> orgs, string orgCode)
        {
            if (orgs == null || string.IsNullOrWhiteSpace(orgCode))
            {
                return null;
            }

            if (!orgs.TryGetValue(orgCode, out OrgData org) && !orgs.TryGetValue(orgCode.ToLowerInvariant(), out org))
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(org?.Emblem))
            {
                return org.Emblem;
            }

            return string.IsNullOrWhiteSpace(org?.Logo) ? null : org.Logo;
        }

        /// <summary>
        /// Map a resource from the resource registry to the frontend resource model
        /// </summary>
        /// <param name="resource">Resource from the resource registry</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="orgs">CDN org data, used to look up the logo of the resource owner</param>
        /// <returns>The mapped resource</returns>
        public static ServiceResourceFE MapToServiceResourceFE(ServiceResource resource, string languageCode, IReadOnlyDictionary<string, OrgData> orgs)
        {
            CompetentAuthority owner = resource.HasCompetentAuthority;
            return new ServiceResourceFE(
                resource.Identifier,
                GetInLanguage(resource.Title, languageCode),
                resourceType: resource.ResourceType,
                status: resource.Status,
                resourceReferences: resource.ResourceReferences,
                resourceOwnerName: GetInLanguage(owner?.Name, languageCode),
                resourceOwnerOrgNumber: owner?.Organization,
                resourceOwnerOrgcode: owner?.Orgcode,
                rightDescription: GetInLanguage(resource.RightDescription, languageCode),
                description: GetInLanguage(resource.Description, languageCode),
                visible: resource.Visible,
                delegable: resource.Delegable,
                contactPoints: resource.ContactPoints,
                keywords: resource.Keywords?.FindAll(kw => kw.Language == languageCode).Select(kw => kw.Word).ToList() ?? [],
                resourceOwnerLogoUrl: ResolveOwnerLogoUrl(orgs, owner?.Orgcode));
        }

        /// <summary>
        /// Map a list of resources from the resource registry to the frontend resource model
        /// </summary>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="resources">List of resources to map to frontend resource objects</param>
        /// <param name="orgs">CDN org data, used to look up the logo of the resource owner</param>
        /// <returns>Output result</returns>
        public static List<ServiceResourceFE> MapToServiceResourcesFE(string languageCode, IEnumerable<ServiceResource> resources, IReadOnlyDictionary<string, OrgData> orgs)
        {
            return resources
                .Where(resource => resource != null)
                .Select(resource => MapToServiceResourceFE(resource, languageCode, orgs))
                .ToList();
        }

        /// <summary>
        /// Map an Access Management resource to the frontend resource model, using only the data Access
        /// Management provides. Resources in access packages are not looked up in the resource registry, as
        /// a package can hold hundreds of them. The provider's own logo url is not trusted; the logo is
        /// resolved from CDN org data by provider code.
        /// </summary>
        /// <param name="resource">Resource from Access Management</param>
        /// <param name="orgs">CDN org data, used to look up the logo of the resource owner</param>
        /// <returns>The mapped resource</returns>
        public static ServiceResourceFE MapToServiceResourceFE(ResourceAM resource, IReadOnlyDictionary<string, OrgData> orgs)
        {
            return MapAccessManagementResource(resource, orgs);
        }

        /// <summary>
        /// Map a list of Access Management resources to the frontend resource model.
        /// See <see cref="MapToServiceResourceFE(ResourceAM, IReadOnlyDictionary{string, OrgData})"/>.
        /// </summary>
        /// <param name="resources">Resources from Access Management</param>
        /// <param name="orgs">CDN org data, used to look up the logo of the resource owner</param>
        /// <returns>The mapped resources, in the same order</returns>
        public static List<ServiceResourceFE> MapToServiceResourcesFE(IEnumerable<ResourceAM> resources, IReadOnlyDictionary<string, OrgData> orgs)
        {
            return (resources ?? [])
                .Where(resource => resource != null)
                .Select(resource => MapAccessManagementResource(resource, orgs))
                .ToList();
        }

        private static ServiceResourceFE MapAccessManagementResource(ResourceAM resource, IReadOnlyDictionary<string, OrgData> orgs)
        {
            return new ServiceResourceFE
            {
                Identifier = resource.RefId,
                Title = resource.Name,
                Description = resource.Description,
                ResourceOwnerName = resource.Provider?.Name,
                ResourceOwnerOrgcode = resource.Provider?.Code,
                ResourceOwnerOrgNumber = resource.Provider?.RefId,
                ResourceOwnerLogoUrl = ResolveOwnerLogoUrl(orgs, resource.Provider?.Code),
                ResourceType = Enum.TryParse<ResourceType>(resource.Type?.Name, true, out var resourceType) ? resourceType : ResourceType.Default,
                Keywords = [],
            };
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

        private static string GetInLanguage(Dictionary<string, string> texts, string languageCode)
        {
            return texts?.GetValueOrDefault(languageCode) ?? texts?.GetValueOrDefault("nb");
        }
    }
}
