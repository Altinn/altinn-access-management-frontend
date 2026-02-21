using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation
{
    /// <summary>
    /// Represents the authenticated user's client delegations grouped by provider.
    /// </summary>
    public class MyClientDelegation
    {
        /// <summary>
        /// Gets or sets the provider that has delegated client access to the authenticated user.
        /// </summary>
        public CompactEntity Provider { get; set; } = new();

        /// <summary>
        /// Gets or sets the clients delegated via the provider.
        /// </summary>
        public List<ClientDelegation> Clients { get; set; } = new();
    }
}
