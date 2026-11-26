using Altinn.AMUI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AMUI.Core.Models.Request.Frontend
{
    /// <summary>
    /// Used to show enriched resource right requests
    /// </summary>
    public class EnrichedResourceRequest : RequestFE
    {
        /// <summary>
        /// The full resource object
        /// </summary>
        public ServiceResourceFE Resource { get; set; }
    }
}