namespace Altinn.AccessManagement.UI.Core.Models.AccessManagement
{
    /// <summary>
    /// An simplified overview of what a rightholder has access to
    /// </summary>
    public class RightHolderAccesses
    {
        /// <summary>
        /// List of IDs for access packages the right holder has access to
        /// </summary>
        public List<string> AccessPackages { get; set; }

        /// <summary>
        /// List of IDs for services the right holder has access to
        /// </summary>
        public List<string> Services { get; set; }

        /// <summary>
        /// List of roles the right holder has access to
        /// </summary>
        public List<string> Roles { get; set; }
    }
}
