using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.Request.Frontend
{
    /// <summary>
    /// Used to show enriched resource right requests
    /// </summary>
    public class EnrichedResourceRequest : SingleRightRequest
    {
        /// <summary>
        /// The full resource object
        /// </summary>
        public ServiceResourceFE Resource { get; set; }
    }
}