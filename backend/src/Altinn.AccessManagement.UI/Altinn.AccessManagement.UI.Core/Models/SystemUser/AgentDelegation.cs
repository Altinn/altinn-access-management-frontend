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

        public DelegationParty From { get; init; }

        public DelegationParty To { get; init; }

        public DelegationParty Facilitator { get; init; }
    }

    public class DelegationParty
    {
        public Guid Id { get; init; }

        public string Name { get; init; }
    }
}