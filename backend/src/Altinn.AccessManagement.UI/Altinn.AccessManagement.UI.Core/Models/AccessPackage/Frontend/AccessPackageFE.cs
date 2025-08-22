using Altinn.AccessManagement.UI.Core.Models.Common;

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
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Resources
        /// </summary>
        public List<AccessPackageResourceFE> Resources { get; set; }

        /// <summary>
        /// Permissions
        /// </summary>
        public List<Permission> Permissions { get; set; }
    }
}