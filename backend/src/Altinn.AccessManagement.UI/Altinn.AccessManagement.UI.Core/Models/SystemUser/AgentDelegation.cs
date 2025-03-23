namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// A client delegation to a system user
    /// </summary>
    public class AgentDelegation
    {
        /// <summary>
        /// Agent system user uuid
        /// </summary>
        public Guid AgentSystemUserId { get; set; }

        /// <summary>
        /// Delegation uuid
        /// </summary>
        public Guid DelegationId { get; set; }

        /// <summary>
        /// Client uuid
        /// </summary>
        public Guid ClientUuid { get; set; }
    }
}