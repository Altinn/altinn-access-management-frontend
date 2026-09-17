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
        private static readonly Dictionary<string, ResourceType> Aliases = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Application", ResourceType.AltinnApp },
        };

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
        /// Map a list of resources to frontend resource objects
        /// </summary>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="resources">List of resources to map to frontend resource objects</param>
        /// <param name="orgs">List resource owner organizations. Used to look up logo for resource owner</param>
        /// <returns>Output result</returns>
        public static List<ServiceResourceFE> MapToServiceResourcesFE(string languageCode, IEnumerable<ServiceResource> resources, IReadOnlyDictionary<string, Models.Common.OrgData> orgs)
        {
            return resources.Where(resource => resource != null)
                .Select(resource => MapToResourceFE(resource, languageCode, orgs))
                .ToList();
        }

        /// <summary>
        /// Maps a resource from the resource registry to the frontend resource model.
        /// </summary>
        /// <remarks>
        /// The single place a registry resource becomes a <see cref="ServiceResourceFE"/>. It used
        /// to be done in three, which is how they drifted apart on keywords and logos.
        /// </remarks>
        /// <param name="resource">Resource to map</param>
        /// <param name="languageCode">Language code. Can be either nb, nn or en</param>
        /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
        /// <returns>The frontend resource model</returns>
        public static ServiceResourceFE MapToResourceFE(ServiceResource resource, string languageCode, IReadOnlyDictionary<string, Models.Common.OrgData> orgs)
        {
            return new ServiceResourceFE
            {
                Identifier = resource.Identifier,
                Title = InLanguage(resource.Title, languageCode),
                Description = InLanguage(resource.Description, languageCode),
                RightDescription = InLanguage(resource.RightDescription, languageCode),
                Status = resource.Status,
                ResourceType = resource.ResourceType,
                ResourceReferences = resource.ResourceReferences,
                AuthorizationReference = resource.AuthorizationReference,
                ContactPoints = resource.ContactPoints,
                Spatial = resource.Spatial,
                Visible = resource.Visible,
                Delegable = resource.Delegable,
                Keywords = KeywordsInLanguage(resource.Keywords, languageCode),
                ResourceOwnerName = InLanguage(resource.HasCompetentAuthority?.Name, languageCode),
                ResourceOwnerOrgNumber = resource.HasCompetentAuthority?.Organization,
                ResourceOwnerOrgcode = resource.HasCompetentAuthority?.Orgcode,
                ResourceOwnerLogoUrl = ResolveOwnerLogoUrl(orgs, resource.HasCompetentAuthority?.Orgcode),
            };
        }

        private static string InLanguage(Dictionary<string, string> translations, string languageCode)
        {
            return translations?.GetValueOrDefault(languageCode) ?? translations?.GetValueOrDefault("nb");
        }

        /// <summary>
        /// Keywords in the requested language, falling back to Norwegian the same way every other
        /// translated field does. Without the fallback a user with no language cookie gets an empty
        /// language code, and every keyword is filtered away.
        /// </summary>
        private static List<string> KeywordsInLanguage(List<Keyword> keywords, string languageCode)
        {
            if (keywords == null)
            {
                return [];
            }

            List<string> inRequestedLanguage = keywords.FindAll(keyword => keyword.Language == languageCode).Select(keyword => keyword.Word).ToList();

            return inRequestedLanguage.Count > 0
                ? inRequestedLanguage
                : keywords.FindAll(keyword => keyword.Language == "nb").Select(keyword => keyword.Word).ToList();
        }

        /// <summary>
        /// Maps resources from Access Management to the frontend resource model.
        /// </summary>
        /// <remarks>
        /// Access management knows less about a resource than the resource registry does, so the
        /// registry-only fields (right description, delegability, status, references) are left unset
        /// rather than guessed at.
        /// </remarks>
        /// <param name="resources">Resources to map</param>
        /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
        /// <returns>The frontend resource models</returns>
        public static List<ServiceResourceFE> MapToResourceFE(IEnumerable<ResourceAM> resources, IReadOnlyDictionary<string, Models.Common.OrgData> orgs)
        {
            return (resources ?? []).Where(resource => resource != null)
                .Select(resource => MapToResourceFE(resource, orgs))
                .ToList();
        }

        /// <summary>
        /// Maps a resource from Access Management to the frontend resource model.
        /// </summary>
        /// <param name="resource">Resource to map</param>
        /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
        /// <returns>The frontend resource model</returns>
        public static ServiceResourceFE MapToResourceFE(ResourceAM resource, IReadOnlyDictionary<string, Models.Common.OrgData> orgs)
        {
            return new ServiceResourceFE
            {
                // Note that RefId is an access management identifier, which is not always a resource
                // registry id. Don't feed it back into resource registry lookups.
                Identifier = resource.RefId,
                Title = resource.Name,
                Description = resource.Description,
                ResourceType = ParseResourceType(resource.Type?.Name),
                ResourceOwnerName = resource.Provider?.Name,
                ResourceOwnerOrgcode = resource.Provider?.Code,
                ResourceOwnerOrgNumber = resource.Provider?.RefId,

                // Provider.LogoUrl is the wide logo; the UI renders the square emblem.
                ResourceOwnerLogoUrl = ResolveOwnerLogoUrl(orgs, resource.Provider?.Code),
            };
        }

        /// <summary>
        /// Translates an access management resource type name to the resource registry vocabulary.
        /// </summary>
        /// <remarks>
        /// The two vocabularies are not identical, and an unrecognised value silently becoming
        /// <see cref="ResourceType.Default"/> is how "Application" ended up rendering as a generic
        /// resource. Known differences are aliased explicitly.
        /// </remarks>
        /// <param name="typeName">The access management type name</param>
        /// <returns>The matching resource type, or <see cref="ResourceType.Default"/></returns>
        public static ResourceType ParseResourceType(string typeName)
        {
            if (string.IsNullOrWhiteSpace(typeName))
            {
                return ResourceType.Default;
            }

            if (Aliases.TryGetValue(typeName.Trim(), out ResourceType aliased))
            {
                return aliased;
            }

            return Enum.TryParse(typeName, true, out ResourceType parsed) ? parsed : ResourceType.Default;
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
