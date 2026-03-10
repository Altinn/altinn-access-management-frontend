using Altinn.AccessManagement.UI.Core.Models.AccessPackage;

namespace Altinn.AccessManagement.UI.Core.Models.InstanceDelegation
{
    /// <summary>
    /// Model representing a resource instance with its associated permissions.
    /// </summary>
    public class InstancePermission
    {
        /// <summary>
        /// Gets or sets the delegated resource.
        /// </summary>
        public ResourceAM Resource { get; set; }

        /// <summary>
        /// Gets or sets the delegated instance.
        /// </summary>
        public DelegationInstance Instance { get; set; }

        /// <summary>
        /// Gets or sets the permissions associated with the instance.
        /// </summary>
        public List<Permission> Permissions { get; set; }
    }
}
