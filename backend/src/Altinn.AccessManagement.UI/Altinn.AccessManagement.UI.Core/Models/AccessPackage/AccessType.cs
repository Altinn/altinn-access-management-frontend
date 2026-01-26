namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage
{
    /// <summary>
    /// Extended EntityType
    /// </summary>
    public class AccessType
    {
        /// <summary>
        /// Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// ProviderId
        /// </summary>
        public Guid ProviderId { get; set; }

        /// <summary>
        /// Name (either "Person" or "Organisasjon")
        /// </summary>
        public string Name { get; set; }
    }
}
