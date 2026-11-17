using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// Access packages frontend model
    /// </summary>
    public class AccessPackageFE
    {
        /// <summary>
        /// Identifier for the access package
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Urn for the access package
        /// </summary>
        public string Urn { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Indicates if the package can be used for delegation
        /// </summary>
        public bool IsAssignable { get; set; }

        /// <summary>
        /// Indicates if the package can be used for delegation
        /// </summary>
        public bool IsDelegable { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The area the package belongs to
        /// </summary>
        public AccessArea Area { get; set; }

        /// <summary>
        /// The type of the package
        /// </summary>
        public TypeDto Type { get; set; }

        /// <summary>
        /// Resources, enriched from the resource registry
        /// </summary>
        public List<ServiceResourceFE> Resources { get; set; }

        /// <summary>
        /// Permissions
        /// </summary>
        public List<PermissionFE> Permissions { get; set; }

        /// <summary>
        /// Maps an access package to the frontend model
        /// </summary>
        /// <param name="accessPackage">The access package</param>
        /// <param name="resources">The package's resources, already mapped to the frontend model</param>
        /// <returns>The mapped access package</returns>
        public static AccessPackageFE FromAccessPackage(AccessPackage accessPackage, List<ServiceResourceFE> resources)
        {
            return new AccessPackageFE
            {
                Id = accessPackage.Id.ToString(),
                Urn = accessPackage.Urn,
                Name = accessPackage.Name,
                Description = accessPackage.Description,
                IsAssignable = accessPackage.IsAssignable,
                IsDelegable = accessPackage.IsDelegable,
                Area = accessPackage.Area,
                Type = accessPackage.Type,
                Resources = resources,
            };
        }
    }
}