namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Model for an Access Package
    /// </summary>
    public record RegisteredSystemAccessPackage
    {
        /// <summary>
        /// The unique identifier for the Access Package
        /// </summary>
        public string Urn { get; set; }
    }
}