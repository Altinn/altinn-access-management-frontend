using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
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
        /// Gets or sets fixed system user right sets
        /// </summary>
        public List<SystemUserSet> SystemUserSets { get; set; } = new();

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
                        AccessPackages = [
                            new() { Urn = "urn:altinn:accesspackage:informasjon-og-kommunikasjon" }, 
                            new() { Urn = "urn:altinn:accesspackage:jordbruk" }
                        ],
                        Resources = []
                    },
                    new()
                    {
                        Name = "Skattegreier-settet",
                        AccessPackages = [
                            new() { Urn = "urn:altinn:accesspackage:skattegrunnlag" }, 
                            new() { Urn = "urn:altinn:accesspackage:jordbruk" }
                        ],
                        Resources = []
                    },
                    new()
                    {
                        Name = "Annet-settet",
                        AccessPackages = [
                            new() { Urn = "urn:altinn:accesspackage:annen-tjenesteyting" }
                        ],
                        Resources = [
                            new() { RefId = "acn-migratedcorrespondence-4540-1" }
                        ]
                    }
                };
            }

            return retVal;
        }
    }

    /// <summary>
    /// List of access packages and resources required in this right set
    /// </summary>
    public class SystemUserSet
    {
        /// <summary>
        /// Gets or sets set name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets set access packages
        /// </summary>
        public List<CompactPackage> AccessPackages { get; set; }

        /// <summary>
        /// Gets or sets set resource
        /// </summary>
        public List<CompactResource> Resources { get; set; }
    }
}