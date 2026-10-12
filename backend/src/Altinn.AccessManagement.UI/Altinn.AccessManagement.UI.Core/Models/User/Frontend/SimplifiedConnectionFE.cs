using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.User.Frontend
{
    /// <summary>
    /// A simplified connection (limited party info, no roles), as sent to the frontend
    /// </summary>
    public class SimplifiedConnectionFE
    {
        /// <summary>
        /// Gets or sets the connected party
        /// </summary>
        public PartyFE Party { get; set; }

        /// <summary>
        /// Gets or sets the connections inherited through this party
        /// </summary>
        public List<SimplifiedConnectionFE> Connections { get; set; } = new();

        /// <summary>
        /// Maps a simplified connection from the limited instance delegation endpoints
        /// </summary>
        public static SimplifiedConnectionFE FromSimplifiedConnection(SimplifiedConnection connection)
        {
            if (connection == null)
            {
                return null;
            }

            return new SimplifiedConnectionFE
            {
                Party = PartyFE.FromSimplifiedParty(connection.Party),
                Connections = connection.Connections?.Select(FromSimplifiedConnection).ToList() ?? new(),
            };
        }
    }
}
