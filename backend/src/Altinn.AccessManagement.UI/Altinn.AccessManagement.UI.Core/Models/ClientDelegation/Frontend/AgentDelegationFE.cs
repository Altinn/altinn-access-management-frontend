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

        public List<SystemUserSet> SystemUserSets { get; set; }

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

            AgentDelegationFE retVal = new AgentDelegationFE
            {
                Agent = PartyFE.FromEntity(delegation.Agent),
                AgentAddedAt = delegation.AgentAddedAt,
                Access = delegation.Access ?? new(),
            };

            if (retVal.Agent.Type == Enums.PartyTypeFE.SystemUser)
            {
                retVal.SystemUserSets = new List<SystemUserSet>()
                {
                    new()
                    {
                        Name = "Jordbruk-informasjon-settet",
                        AccessPackages = ["urn:altinn:accesspackage:informasjon-og-kommunikasjon", "urn:altinn:accesspackage:jordbruk"],
                        Resources = []
                    },
                    new()
                    {
                        Name = "Skattegreier-settet",
                        AccessPackages = ["urn:altinn:accesspackage:skattegrunnlag", "urn:altinn:accesspackage:jordbruk"],
                        Resources = []
                    },
                    new()
                    {
                        Name = "Annet-settet",
                        AccessPackages = ["urn:altinn:accesspackage:annen-tjenesteyting"],
                        Resources = ["acn-migratedcorrespondence-4540-1"]
                    }
                };
            }

            return retVal;
        }
    }

    public class SystemUserSet
    {
        public string Name { get; set; }

        public List<string> AccessPackages { get; set; }

        public List<string> Resources { get; set; }
    }
}