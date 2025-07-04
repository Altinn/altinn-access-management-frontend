namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// A resource attribute identifying part or whole resource
    /// </summary>
    public class ConsentResourceAttribute
    {
        /// <summary>
        /// The type of resource attribute. is a urn
        /// </summary>
        public required string Type { get; set; }

        /// <summary>
        /// The value of the resource attribute
        /// </summary>
        public required string Value { get; set; }
    }
}