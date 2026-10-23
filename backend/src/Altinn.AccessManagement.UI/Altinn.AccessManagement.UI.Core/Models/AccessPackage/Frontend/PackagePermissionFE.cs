namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// An access package with the permissions given for it, as sent to the frontend
    /// </summary>
    public class PackagePermissionFE
    {
        /// <summary>
        /// Gets or sets the package the permissions are for
        /// </summary>
        public CompactPackage Package { get; set; }

        /// <summary>
        /// Gets or sets the permissions
        /// </summary>
        public List<PermissionFE> Permissions { get; set; } = new();

        /// <summary>
        /// Maps a package permission from the access management permission endpoints
        /// </summary>
        public static PackagePermissionFE FromPackagePermission(PackagePermission packagePermission)
        {
            if (packagePermission == null)
            {
                return null;
            }

            return new PackagePermissionFE
            {
                Package = packagePermission.Package,
                Permissions = PermissionFE.FromPermissions(packagePermission.Permissions),
            };
        }
    }
}
