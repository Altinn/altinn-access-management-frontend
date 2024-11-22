using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

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
        public AccessPackage AccessPackage { get; set; }

        /// <summary>
        /// Details pertaining the deleagtion of the access
        /// </summary>
        public AccessDetails DelegationDetails { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="accessPackage">the access package</param>
        /// <param name="delegationDetails">the delegation details</param>
        public AccessPackageDelegation(AccessPackage accessPackage, AccessDetails delegationDetails)
        {
            AccessPackage = accessPackage;
            DelegationDetails = delegationDetails;
        }
    }
}
