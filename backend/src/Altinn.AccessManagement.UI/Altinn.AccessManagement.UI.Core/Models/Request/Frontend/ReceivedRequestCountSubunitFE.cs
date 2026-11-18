using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.Request.Frontend
{
    /// <summary>
    /// Used to show the number of received requests for a subunit in the frontend
    /// </summary>
    public class ReceivedRequestCountSubunitFE
    {
        /// <summary>
        /// The subunit
        /// </summary>
        public PartyFE Party { get; set; }

        /// <summary>
        /// Number of requests received by the subunit
        /// </summary>
        public int Count { get; set; }
    }
}
