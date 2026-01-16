using System;
using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;

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
        }
    }
}
