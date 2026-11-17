namespace Altinn.AccessManagement.UI.Core.Models.Role.Frontend
{
    /// <summary>
    /// An area for grouping similar types of roles
    /// </summary>
    public class RoleAreaFE
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

        /// <summary>
        /// The roles that are in this group
        /// </summary>
        public List<Role> Roles { get; set; }

        /// <summary>
        /// Constructor for enritching an area with roles to make it into an RoleAreaFE
        /// </summary>
        public RoleAreaFE(RoleArea area, List<Role> roles)
        {
            Id = area.Id;
            Name = area.Name;
            Description = area.Description;
            IconUrl = area.IconUrl;
            Roles = roles;
        }

        /// <summary>
        /// Default contructor
        /// </summary>
        public RoleAreaFE()
        {
        }
    }
}
