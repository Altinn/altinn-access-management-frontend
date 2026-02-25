using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight
{
    /// <summary>
    ///     Used to display a delegation in GUI, complete with the delegated rights and information about the resource
    /// </summary>
    public class ResourceDelegation
    {
        /// <summary>
        ///     The resource delegated.
        /// </summary>
        public ServiceResourceFE Resource { get; set; }

        /// <summary>
        ///     List of permissions for the delegation
        /// </summary>
        public List<Permission> Permissions { get; set; }

        /// <summary>
        ///     Constructor
        /// </summary>
        public ResourceDelegation(ServiceResourceFE resource, List<Permission> permissions)
        {
            Resource = resource;
            Permissions = permissions;
        }
    }
}
