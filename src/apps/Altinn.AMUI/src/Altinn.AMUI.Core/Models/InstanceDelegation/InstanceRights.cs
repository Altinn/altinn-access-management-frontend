using Altinn.AMUI.Core.Models.AccessPackage;
using Altinn.AMUI.Core.Models.SingleRight;

namespace Altinn.AMUI.Core.Models.InstanceDelegation
{
    /// <summary>
    /// Model representing an instance with its associated rights and permissions.
    /// </summary>
    public class InstanceRights
    {
        /// <summary>
        /// Gets or sets the resource.
        /// </summary>
        public required ResourceAM Resource { get; set; }

        /// <summary>
        /// Gets or sets the delegated instance.
        /// </summary>
        public required DelegationInstance Instance { get; set; }

        /// <summary>
        /// Gets or sets the direct rights for the instance.
        /// </summary>
        public required List<RightAccess> DirectRights { get; set; }

        /// <summary>
        /// Gets or sets the indirect rights for the instance.
        /// </summary>
        public required List<RightAccess> IndirectRights { get; set; }
    }
}
