namespace Altinn.AccessManagement.UI.Core.Models.User
{
    /// <summary>
    /// Represents detailed information about a right holder relationship (assignment) between parties,
    /// including delegation, roles, and facilitators. This model is aligned with the structure from the external API.
    /// </summary>
    public class Connection
    {
        /// <summary>
        /// Gets or sets party.
        /// </summary>
        public Entity Party { get; set; } = new();

        /// <summary>
        /// Gets or sets roles the party has for given filter.
        /// </summary>
        public List<RoleInfo> Roles { get; set; } = new();

        /// <summary>
        /// Gets or sets connections the party has.
        /// Users under the party.
        /// </summary>
        public List<Connection> Connections { get; set; } = new();
    }
}
