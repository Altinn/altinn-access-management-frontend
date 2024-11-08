namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// An area for grouping similar types of access packages
    /// </summary>
    public class AccessAreaFE
    {
        /// <summary>
        /// Identifier of the AccessArea
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Descriotion
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// An url that provides the Icon associated with this area and it's access packages
        /// </summary>
        public string IconUrl { get; set; }

        /// <summary>
        /// The packages that are in this group
        /// </summary>
        public List<AccessPackage> AccessPackages { get; set; }

        public AccessAreaFE( AccessArea area, List<AccessPackage> packages)
        {
            Id = area.Id;
            Name = area.Name;
            Description = area.Description;
            IconUrl = area.IconUrl;
            AccessPackages = packages;
        }
    }
}
