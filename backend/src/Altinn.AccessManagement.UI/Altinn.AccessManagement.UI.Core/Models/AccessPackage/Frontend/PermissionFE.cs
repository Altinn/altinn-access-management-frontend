using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// A permission between two parties, as sent to the frontend
    /// </summary>
    public class PermissionFE
    {
        /// <summary>
        /// Gets or sets the party the permission is from
        /// </summary>
        public PartyFE From { get; set; }

        /// <summary>
        /// Gets or sets the party the permission is to
        /// </summary>
        public PartyFE To { get; set; }

        /// <summary>
        /// Gets or sets the party the permission is inherited through, if any
        /// </summary>
        public PartyFE Via { get; set; }

        /// <summary>
        /// Gets or sets the role
        /// </summary>
        public CompactRole Role { get; set; }

        /// <summary>
        /// Gets or sets the role the permission is inherited through, if any
        /// </summary>
        public CompactRole ViaRole { get; set; }

        /// <summary>
        /// Gets or sets the reason for the permission
        /// </summary>
        public Reason Reason { get; set; }

        /// <summary>
        /// Maps a permission from the access management permission endpoints
        /// </summary>
        public static PermissionFE FromPermission(Permission permission)
        {
            if (permission == null)
            {
                return null;
            }

            return new PermissionFE
            {
                From = PartyFE.FromCompactEntity(permission.From),
                To = PartyFE.FromCompactEntity(permission.To),
                Via = PartyFE.FromCompactEntity(permission.Via),
                Role = permission.Role,
                ViaRole = permission.ViaRole,
                Reason = permission.Reason,
            };
        }

        /// <summary>
        /// Maps a list of permissions, treating null as empty
        /// </summary>
        public static List<PermissionFE> FromPermissions(IEnumerable<Permission> permissions)
        {
            return permissions?.Select(FromPermission).ToList() ?? new();
        }
    }
}
