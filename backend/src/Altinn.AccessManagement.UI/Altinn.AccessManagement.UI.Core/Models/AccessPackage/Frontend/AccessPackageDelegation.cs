using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.Platform.Register.Models;

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
        public string AccessPackageId { get; set; }

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

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="accessPackageId">the id of access package</param>
        /// <param name="delegationDetails">the delegation details</param>
        /// <param name="inherited">If inherited or delegated directly</param>
        /// <param name="inheritedFrom">The party from which the access was inherited</param>
        public AccessPackageDelegation(string accessPackageId, AccessDetails delegationDetails, bool inherited, PartyFE inheritedFrom = null)
        {
            AccessPackageId = accessPackageId;
            DelegationDetails = delegationDetails;
            Inherited = inherited;
            InheritedFrom = inheritedFrom;
        }
    }
}
