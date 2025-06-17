using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessMgmt.Core.Models;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// An access package that has been delegated to someone
    /// </summary>
    public class AccessPackageDelegation
    {
        /// <summary>
        /// The access package that the recipient has access to
        /// </summary>
        public Guid AccessPackageId { get; set; }

        /// <summary>
        /// Details pertaining the deleagtion of the access
        /// </summary>
        public AccessDetails DelegationDetails { get; set; }

        /// <summary>
        /// If the access is inherited
        /// </summary>
        public bool Inherited { get; set; }

        /// <summary>
        /// The party from which the access was inherited
        /// </summary>
        public PartyFE InheritedFrom { get; set; }
    }
}
