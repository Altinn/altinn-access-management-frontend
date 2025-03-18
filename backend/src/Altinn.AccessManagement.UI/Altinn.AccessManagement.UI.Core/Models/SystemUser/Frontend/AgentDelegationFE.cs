namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// A client delegation to a system user
    /// </summary>
    public class AgentDelegationFE
    {
        /// <summary>
        /// Assignment uuid
        /// </summary>
        public Guid AssignmentId { get; set; }

        /// <summary>
        /// Delegated customer party uuid
        /// </summary>
        public required Guid CustomerUuid { get; set; }
    }
}