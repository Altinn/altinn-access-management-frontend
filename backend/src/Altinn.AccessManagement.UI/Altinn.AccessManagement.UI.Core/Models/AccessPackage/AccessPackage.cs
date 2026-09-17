using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// An access package as it is served to the frontend, with resources in the one resource model.
    /// </summary>
    public class AccessPackage
    {
        /// <summary>
        /// Identifier for the access package
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Urn
        /// </summary>
        public string Urn { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Whether the package can be assigned
        /// </summary>
        public bool IsAssignable { get; set; }

        /// <summary>
        /// Whether the package can be delegated
        /// </summary>
        public bool IsDelegable { get; set; }

        /// <summary>
        /// The area the package belongs to
        /// </summary>
        public AccessArea Area { get; set; }

        /// <summary>
        /// The resources the package gives access to
        /// </summary>
        public List<ServiceResourceFE> Resources { get; set; }

        /// <summary>
        /// The package type
        /// </summary>
        public TypeDto Type { get; set; }

        /// <summary>
        /// Maps an access management access package to the frontend model.
        /// </summary>
        /// <param name="package">The upstream access package</param>
        /// <param name="orgs">Organization data from the Altinn CDN. Used to look up the service owner logo</param>
        /// <returns>The frontend model</returns>
        public static AccessPackage FromAm(AccessPackageAM package, IReadOnlyDictionary<string, OrgData> orgs)
        {
            return new AccessPackage
            {
                Id = package.Id,
                Name = package.Name,
                Urn = package.Urn,
                Description = package.Description,
                IsAssignable = package.IsAssignable,
                IsDelegable = package.IsDelegable,
                Area = package.Area,
                Type = package.Type,
                Resources = ResourceUtils.MapToResourceFE(package.Resources, orgs),
            };
        }
    }

    /// <summary>
    /// Type DTO for AccessPackage
    /// </summary>
    public class TypeDto
    {
        /// <summary>
        /// Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// ProviderId
        /// </summary>
        public Guid ProviderId { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }
    }
}
