namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// A client delegation to a system user
    /// </summary>
    public class AgentDelegation
    {
        /// <summary>
        /// Assignment id
        /// </summary>
        public Guid Id { get; init; }

        /// <summary>
        /// From party
        /// </summary>
        public DelegationParty From { get; init; }

        /// <summary>
        /// To party
        /// </summary>
        public DelegationParty To { get; init; }

        /// <summary>
        /// Facilitator - the agent system user
        /// </summary>
        public DelegationParty Facilitator { get; init; }
    }

    /// <summary>
    /// Delegation Party for AgentDelegation
    /// </summary>
    public class DelegationParty
    {
        /// <summary>
        /// Party id
        /// </summary>
        public Guid Id { get; init; }

        /// <summary>
        /// Party name
        /// </summary>
        public string Name { get; init; }
    }
}