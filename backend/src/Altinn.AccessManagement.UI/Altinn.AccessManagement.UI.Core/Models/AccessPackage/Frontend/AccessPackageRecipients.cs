using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// The right holders which have been given access to a certain access package
    /// </summary>
    public class AccessPackageRecipients
    {
        /// <summary>
        /// The access package that has been delegated
        /// </summary>
        public AccessPackage AccessPackage { get; set; }

        /// <summary>
        /// To whom the access package has been delegated
        /// </summary>
        public List<Recipient> Recipients { get; set; }
    }
}
