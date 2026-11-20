namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Composite Key instances
    /// </summary>
    public class ClientRoleAccessPackages
    {
        /// <summary>
        /// Role
        /// </summary>
        public string Role { get; set; }

        /// <summary>
        /// Packages
        /// </summary>
        public string[] Packages { get; set; }
    }
}