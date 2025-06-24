namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// Model for representing an access package
    /// </summary>
    public class AccessPackage
    {
        /// <summary>
        /// Gets or sets the unique identifier for the package.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the package.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the unique resource name (URN) for the package.
        /// </summary>
        public string Urn { get; set; }

        /// <summary>
        /// Gets or sets the description of the package.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Indicates if the package can be assigned directly
        /// </summary>
        public bool IsAssignable { get; set; }

        /// <summary>
        /// Indicates if the package can be used for delegation
        /// </summary>
        public bool IsDelegable { get; set; }

        /// <summary>
        /// Gets or sets the area associated with the package.
        /// </summary>
        public AccessArea Area { get; set; }

        /// <summary>
        /// Gets or sets the collection of resources linked to the package.
        /// </summary>
        public IEnumerable<ResourceAM> Resources { get; set; }
    }
}
