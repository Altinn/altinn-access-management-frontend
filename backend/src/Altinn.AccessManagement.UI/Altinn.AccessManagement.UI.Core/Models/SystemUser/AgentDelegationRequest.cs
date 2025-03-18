namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Payload when adding a party to agent system user
    /// </summary>
    public class AgentDelegationRequest
    {
        /// <summary>
        /// The party uuid to add
        /// </summary>
        public Guid CustomerUuid { get; set; }

        /// <summary>
        /// PartyUuid of party which owns the agent system user
        /// </summary>
        public Guid FacilitatorUuid { get; set; }
    }
}