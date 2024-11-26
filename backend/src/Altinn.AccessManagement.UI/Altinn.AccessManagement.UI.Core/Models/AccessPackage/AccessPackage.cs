using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// Model for representing an access package
    /// </summary>
    public class AccessPackage
    {
        /// <summary>
        /// Identifier for the access package
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Resources
        /// </summary>
        public List<IdNamePair> Resources { get; set; }

        /// <summary>
        /// The area that this access package belongs to
        /// </summary>
        public AccessArea Area { get; set; }
    }
}
