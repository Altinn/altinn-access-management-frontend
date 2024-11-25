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
        public string AccessPackageId { get; set; }

        /// <summary>
        /// Details pertaining the deleagtion of the access
        /// </summary>
        public AccessDetails DelegationDetails { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="accessPackageId">the id of access package</param>
        /// <param name="delegationDetails">the delegation details</param>
        public AccessPackageDelegation(string accessPackageId, AccessDetails delegationDetails)
        {
            AccessPackageId = accessPackageId;
            DelegationDetails = delegationDetails;
        }
    }
}
