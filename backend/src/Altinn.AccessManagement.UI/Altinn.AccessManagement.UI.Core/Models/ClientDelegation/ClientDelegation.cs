using System;
using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation
{
    /// <summary>
    /// Represents a client delegation item with access details.
    /// </summary>
    public class ClientDelegation
    {
        /// <summary>
        /// Gets or sets the client entity.
        /// </summary>
        public CompactEntity Client { get; set; } = new();

        /// <summary>
        /// Gets or sets a collection of access information for the client.
        /// </summary>
        public List<RoleAccessPackages> Access { get; set; } = new();

        /// <summary>
        /// Composite key instances for role and packages.
        /// </summary>
        public class RoleAccessPackages
        {
            /// <summary>
            /// Gets or sets the role.
            /// </summary>
            public CompactRole Role { get; set; } = new();

            /// <summary>
            /// Gets or sets the packages for the role.
            /// </summary>
            public CompactPackage[] Packages { get; set; } = Array.Empty<CompactPackage>();

            /// <summary>
            /// Gets or sets the single rights resources for the role. Only populated by the v2 client delegation API.
            /// </summary>
            public CompactResource[] Resources { get; set; } = Array.Empty<CompactResource>();
        }
    }

    /// <summary>
    /// Compact resource model
    /// </summary>
    public class CompactResource
    {
        /// <summary>
        /// Gets or sets the internal resource id.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the resource registry id. The key the resource registry, delegation checks
        /// and the delegate/remove payloads are all addressed by.
        /// </summary>
        public string RefId { get; set; }

        /// <summary>
        /// Gets or sets the resource as described by the resource registry. Not part of the client
        /// delegation API response — looked up by <see cref="RefId"/> before the response leaves the
        /// BFF, so the frontend can render a resource without a second round trip.
        /// Null when the registry has no resource with this <see cref="RefId"/>.
        /// </summary>
        public ServiceResourceFE Details { get; set; }
    }
}
