namespace Altinn.AccessManagement.UI.Core.Models.Connections
{
    /// <summary>
    /// The response model for adding a connection
    /// </summary> 
    public class AddConnectionResponse
    {
        /// <summary>
        /// Users uuid.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// New role id.
        /// </summary>
        public Guid RoleI { get; set; }

        /// <summary>
        /// From id.
        /// </summary>
        public Guid FromId { get; set; }

        /// <summary>
        /// To id.
        /// </summary>
        public Guid ToId { get; set; }
    }
}
