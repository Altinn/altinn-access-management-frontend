using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// An active access package delegation
    /// </summary>
    public class AccessPackageAccess
    {
        /// <summary>
        /// The access package
        /// </summary>
        public AccessPackage AccessPackage { get; set; }

        /// <summary>
        /// The recipient of the access
        /// </summary>
        public Recipient To { get; set; }

        /// <summary>
        /// The provider of the access
        /// </summary>
        public Recipient From { get; set; }

        /// <summary>
        /// Details pertaining the access itself
        /// </summary>
        public AccessDetails AccessDetails { get; set; }

        /*
        /// <summary>
        /// The recipients of the access package
        /// </summary>
        public List<AccessRecipient> To { get; set; }

        /// <summary>
        /// The providor of the access
        /// </summary>
        public List<AccessGrantor> From { get; set; }
        */
    }
}
