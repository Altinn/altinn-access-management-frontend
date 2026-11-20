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

        /// <summary>
        /// Gets or sets a collection of all access information for the client 
        /// </summary>
        public List<ClientRoleAccessPackages> Access { get; set; } = [];
    }
}