namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation
{
    /// <summary>
    /// Assignment details for client delegation.
    /// </summary>
    public class AssignmentDto
    {
        /// <summary>
        /// Assignment id.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Role id.
        /// </summary>
        public Guid RoleId { get; set; }

        /// <summary>
        /// Delegating party id.
        /// </summary>
        public Guid FromId { get; set; }

        /// <summary>
        /// Receiving party id.
        /// </summary>
        public Guid ToId { get; set; }
    }
}
