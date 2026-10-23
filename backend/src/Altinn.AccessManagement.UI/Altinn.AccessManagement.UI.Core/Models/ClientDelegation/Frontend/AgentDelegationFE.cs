using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation.Frontend
{
    /// <summary>
    /// An agent with the client access delegated to it, as sent to the frontend
    /// </summary>
    public class AgentDelegationFE
    {
        /// <summary>
        /// Gets or sets the agent
        /// </summary>
        public PartyFE Agent { get; set; }

        /// <summary>
        /// Gets or sets when the agent was added
        /// </summary>
        public DateTimeOffset AgentAddedAt { get; set; }

        /// <summary>
        /// Gets or sets the access per role
        /// </summary>
        public List<ClientDelegation.RoleAccessPackages> Access { get; set; } = new();

        /// <summary>
        /// Maps an agent delegation from the access management client delegation endpoints
        /// </summary>
        public static AgentDelegationFE FromAgentDelegation(AgentDelegation delegation)
        {
            if (delegation == null)
            {
                return null;
            }

            return new AgentDelegationFE
            {
                Agent = PartyFE.FromCompactEntity(delegation.Agent),
                AgentAddedAt = delegation.AgentAddedAt,
                Access = delegation.Access ?? new(),
            };
        }
    }
}
