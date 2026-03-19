using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Models.Request.Frontend
{
    /// <summary>
    /// Used to show single right requests
    /// </summary>
    public class SingleRightRequest
    {
        /// <summary>
        /// Request id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Discriminator indicating the request type: "resource", "package", or "assignment"
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Request status (e.g. draft, pending, approved, rejected, withdrawn)
        /// </summary>
        public RequestStatus Status { get; set; }

        /// <summary>
        /// Party that is requested to grant access
        /// </summary>
        public Entity From { get; set; }

        /// <summary>
        /// Party that access is requested for
        /// </summary>
        public Entity To { get; set; }

        /// <summary>
        /// The resource id access is requested for
        /// </summary>
        public string ResourceId { get; set; }

        /// <summary>
        /// The full resource object
        /// </summary>
        public ServiceResourceFE? Resource { get; set; }

        /// <summary>
        /// Last updated
        /// </summary>
        public DateTimeOffset LastUpdated { get; set; }
    }
}