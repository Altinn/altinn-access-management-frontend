#nullable enable

using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Models.Request.Frontend
{
    /// <summary>
    /// Used to show requests in the frontend
    /// </summary>
    public class RequestFE
    {
        /// <summary>
        /// Request id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Discriminator indicating the request type: "resource", "package"
        /// </summary>
        public required string Type { get; set; }

        /// <summary>
        /// Request status (e.g. draft, pending, approved, rejected, withdrawn)
        /// </summary>
        public RequestStatus Status { get; set; }

        /// <summary>
        /// Party that is requested to grant access
        /// </summary>
        public required Entity From { get; set; }

        /// <summary>
        /// Party that access is requested for
        /// </summary>
        public required Entity To { get; set; }

        /// <summary>
        /// The resource id access is requested for (requests are either for a resource or a package, so only one of ResourceId and PackageId will be set)
        /// </summary>
        public string? ResourceId { get; set; }

        /// <summary>
        /// The package id access is requested for (requests are either for a resource or a package, so only one of ResourceId and PackageId will be set)
        /// </summary>
        public string? PackageId { get; set; }

        /// <summary>
        /// Last updated
        /// </summary>
        public DateTimeOffset LastUpdated { get; set; }
    }
}