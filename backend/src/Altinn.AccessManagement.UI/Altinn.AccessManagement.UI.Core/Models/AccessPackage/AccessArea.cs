namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// An area for grouping similar types of access packages
    /// </summary>
    internal class AccessArea
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
    }
}
