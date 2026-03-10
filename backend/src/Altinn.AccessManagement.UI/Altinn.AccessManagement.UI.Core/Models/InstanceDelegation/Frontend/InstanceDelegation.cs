using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend
{
    /// <summary>
    /// Used to display an instance delegation in GUI, complete with the delegated permissions and information about the resource.
    /// </summary>
    public class InstanceDelegation
    {
        /// <summary>
        /// Gets or sets the resource delegated.
        /// </summary>
        public ServiceResourceFE Resource { get; set; }

        /// <summary>
        /// Gets or sets the delegated instance.
        /// </summary>
        public DelegationInstance Instance { get; set; }

        /// <summary>
        /// Gets or sets the permissions for the delegation.
        /// </summary>
        public List<Permission> Permissions { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceDelegation"/> class.
        /// </summary>
        /// <param name="resource">The delegated resource.</param>
        /// <param name="instance">The delegated instance.</param>
        /// <param name="permissions">The delegation permissions.</param>
        public InstanceDelegation(ServiceResourceFE resource, DelegationInstance instance, List<Permission> permissions)
        {
            Resource = resource;
            Instance = instance;
            Permissions = permissions;
        }
    }
}
