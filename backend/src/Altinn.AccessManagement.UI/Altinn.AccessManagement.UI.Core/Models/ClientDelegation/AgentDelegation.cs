using System;
using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation
{
    /// <summary>
    /// Represents an agent delegation item with access details.
    /// </summary>
    public class AgentDelegation
    {
        /// <summary>
        /// Gets or sets the agent entity.
        /// </summary>
        public CompactEntity Agent { get; set; } = new();

        /// <summary>
        /// Gets or sets when the agent was added.
        /// </summary>
        public DateTimeOffset AgentAddedAt { get; set; }

        /// <summary>
        /// Gets or sets a collection of access information for the agent.
        /// </summary>
        public List<ClientDelegation.RoleAccessPackages> Access { get; set; } = new();
    }
}
