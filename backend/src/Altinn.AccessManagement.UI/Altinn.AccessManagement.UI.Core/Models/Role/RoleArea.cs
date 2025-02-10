namespace Altinn.AccessManagement.UI.Core.Models.Role
{
    /// <summary>
    /// An area for grouping similar types of roles
    /// </summary>
    public class RoleArea
    {
        /// <summary>
        /// Identifier of the RoleArea
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// An url that provides the Icon associated with this area and it's roles
        /// </summary>
        public string IconUrl { get; set; }
    }
}
