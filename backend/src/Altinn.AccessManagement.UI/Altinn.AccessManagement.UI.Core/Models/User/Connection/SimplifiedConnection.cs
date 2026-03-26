namespace Altinn.AccessManagement.UI.Core.Models.User
{
    /// <summary>
    /// Simplified connection for listing available users in instance delegation.
    /// Returned by limited instance delegation endpoints for instance admins without full admin access.
    /// </summary>
    public class SimplifiedConnection
    {
        /// <summary>
        /// Gets or sets the party information.
        /// </summary>
        public SimplifiedParty Party { get; set; }

        /// <summary>
        /// Gets or sets sub-connections (nested users under this party).
        /// </summary>
        public List<SimplifiedConnection> Connections { get; set; } = new();
    }
}
