using Altinn.AMUI.Core.Models.Common.Frontend;

namespace Altinn.AMUI.Core.Models.User.Frontend
{
    /// <summary>
    /// A connection between two parties, as sent to the frontend
    /// </summary>
    public class ConnectionFE
    {
        /// <summary>
        /// Gets or sets the connected party
        /// </summary>
        public PartyFE Party { get; set; }

        /// <summary>
        /// Gets or sets the roles the party has in the connection
        /// </summary>
        public List<RoleInfo> Roles { get; set; } = new();

        /// <summary>
        /// Gets or sets the roles the party has in the parent connection's party
        /// </summary>
        public List<RoleInfo> ViaRoles { get; set; } = new();

        /// <summary>
        /// Gets or sets the connections inherited through this party
        /// </summary>
        public List<ConnectionFE> Connections { get; set; } = new();

        /// <summary>
        /// Maps a connection from the access management connection endpoints
        /// </summary>
        public static ConnectionFE FromConnection(Connection connection)
        {
            if (connection == null)
            {
                return null;
            }

            return new ConnectionFE
            {
                Party = PartyFE.FromEntity(connection.Party),
                Roles = connection.Roles ?? new(),
                ViaRoles = connection.ViaRoles ?? new(),
                Connections = connection.Connections?.Select(FromConnection).ToList() ?? new(),
            };
        }
    }
}
