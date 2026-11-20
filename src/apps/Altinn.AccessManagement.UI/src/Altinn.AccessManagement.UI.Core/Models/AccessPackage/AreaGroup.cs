namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// For grouping of Areas
    /// </summary>
    public class AreaGroup
    {
        /// <summary>
        /// Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// EntityTypeId
        /// </summary>
        public Guid EntityTypeId { get; set; }

        /// <summary>
        /// Urn
        /// </summary>
        public string Urn { get; set; }
    }
}
