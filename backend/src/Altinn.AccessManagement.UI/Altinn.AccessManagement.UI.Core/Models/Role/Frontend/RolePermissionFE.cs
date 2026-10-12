using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using AccessManagementRole = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Core.Models.Role.Frontend
{
    /// <summary>
    /// A role with the permissions given for it, as sent to the frontend
    /// </summary>
    public class RolePermissionFE
    {
        /// <summary>
        /// Gets or sets the role metadata
        /// </summary>
        public AccessManagementRole Role { get; set; }

        /// <summary>
        /// Gets or sets the permissions
        /// </summary>
        public List<PermissionFE> Permissions { get; set; } = new();

        /// <summary>
        /// Maps a role permission from the access management permission endpoints
        /// </summary>
        public static RolePermissionFE FromRolePermission(RolePermission rolePermission)
        {
            if (rolePermission == null)
            {
                return null;
            }

            return new RolePermissionFE
            {
                Role = rolePermission.Role,
                Permissions = PermissionFE.FromPermissions(rolePermission.Permissions),
            };
        }
    }
}
