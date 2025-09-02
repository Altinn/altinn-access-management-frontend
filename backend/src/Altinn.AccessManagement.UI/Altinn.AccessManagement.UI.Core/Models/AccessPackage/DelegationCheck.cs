namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// Result of a delegation check for a single package
    /// </summary>
    public class DelegationCheck
    {
        /// <summary>
        /// Package the delegation check is regarding
        /// </summary>
        public required CompactPackage Package { get; set; }

        /// <summary>
        /// Result of the delegation check. True if the user is authorized to give others access to the package on behalf of the specified party, false otherwise.
        /// </summary>
        public bool Result { get; set; }

        /// <summary>
        /// Reason objects explaining the result.
        /// </summary>
        public List<Reason> Reasons { get; set; }

        /// <summary>
        /// Reason describing why the user can or cannot delegate.
        /// </summary>
        public class Reason
        {
            /// <summary>
            /// Description of the reason.
            /// </summary>
            public required string Description { get; set; }
        }
    }
}
