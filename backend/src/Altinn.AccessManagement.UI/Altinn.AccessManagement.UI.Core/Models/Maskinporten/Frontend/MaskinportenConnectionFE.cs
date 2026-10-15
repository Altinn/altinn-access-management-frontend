using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.Maskinporten.Frontend
{
    /// <summary>
    /// A Maskinporten supplier or consumer of the selected party, as sent to the frontend
    /// </summary>
    public class MaskinportenConnectionFE
    {
        /// <summary>
        /// Gets or sets the connected party
        /// </summary>
        public PartyFE Party { get; set; }

        /// <summary>
        /// Gets or sets the roles that apply to the connected party
        /// </summary>
        public List<CompactRole> Roles { get; set; } = new();

        /// <summary>
        /// Maps a connection from the access management Maskinporten endpoints
        /// </summary>
        public static MaskinportenConnectionFE FromMaskinportenConnection(MaskinportenConnection connection)
        {
            if (connection == null)
            {
                return null;
            }

            return new MaskinportenConnectionFE
            {
                Party = PartyFE.FromCompactEntity(connection.Party),
                Roles = connection.Roles ?? new(),
            };
        }
    }
}
