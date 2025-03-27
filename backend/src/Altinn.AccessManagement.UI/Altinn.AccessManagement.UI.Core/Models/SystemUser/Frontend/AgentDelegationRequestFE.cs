namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Payload when adding a party to agent system user
    /// </summary>
    public class AgentDelegationRequestFE
    {
        /// <summary>
        /// The party uuid to add
        /// </summary>
        public Guid CustomerId { get; set; }
    }
}