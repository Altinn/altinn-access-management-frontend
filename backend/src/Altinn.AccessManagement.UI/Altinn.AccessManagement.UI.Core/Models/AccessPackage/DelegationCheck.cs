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
        public IEnumerable<Reason> Reasons { get; set; } = Array.Empty<Reason>();

        /// <summary>
        /// Reason describing why the user can or cannot delegate.
        /// </summary>
        public class Reason
        {
            /// <summary>
            /// Description of the reason.
            /// </summary>
            public required string Description { get; set; }

            /// <summary>
            /// Role ID of the role providing access
            /// </summary>
            public Guid? RoleId { get; set; }

            /// <summary>
            /// Role URN of the role providing access
            /// </summary>
            public string? RoleUrn { get; set; }

            /// <summary>
            /// From party ID of the role providing access
            /// </summary>
            public Guid? FromId { get; set; }

            /// <summary>
            /// Name of the party providing access
            /// </summary>
            public string? FromName { get; set; }

            /// <summary>
            /// To party ID of the role providing access
            /// </summary>
            public Guid? ToId { get; set; }

            /// <summary>
            /// Name of the party the role is providing access to
            /// </summary>
            public string? ToName { get; set; }

            /// <summary>
            /// Via party ID of the keyrole party the user has inherited access through
            /// </summary>
            public Guid? ViaId { get; set; }

            /// <summary>
            /// Name of the party the user has inherited access through
            /// </summary>
            public string? ViaName { get; set; }

            /// <summary>
            /// Role ID for the keyrole the user has for the ViaId party
            /// </summary>
            public Guid? ViaRoleId { get; set; }

            /// <summary>
            /// Role URN for the keyrole the user has for the ViaId party
            /// </summary>
            public string? ViaRoleUrn { get; set; }
        }
    }
}
