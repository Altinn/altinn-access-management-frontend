using Altinn.AMUI.Core.Models.Common;
using Altinn.AMUI.Core.Models.User;

namespace Altinn.AMUI.Core.Models.Maskinporten
{
    /// <summary>
    /// Maskinporten connection between the selected party and a supplier or consumer.
    /// </summary>
    public class MaskinportenConnection
    {
        /// <summary>
        /// The connected party.
        /// </summary>
        public Entity Party { get; set; } = new();

        /// <summary>
        /// The roles that apply to the connected party.
        /// </summary>
        public List<CompactRole> Roles { get; set; } = new();
    }
}
