#nullable enable
namespace Altinn.AccessManagement.UI.Core.Models.Common
{
    /// <summary>
    /// Represents organization data from Altinn CDN.
    /// </summary>
    public class OrgData
    {
        /// <summary>
        /// Gets or sets the organization name in different languages.
        /// </summary>
        // Use Dictionary<string, string> to match the JSON structure
        public Dictionary<string, string>? Name { get; set; }

        /// <summary>
        /// Gets or sets the organization logo url.
        /// </summary>
        public string? Logo { get; set; }

        /// <summary>
        /// Gets or sets the organization emblem url.
        /// </summary>
        public string? Emblem { get; set; }

        /// <summary>
        /// Gets or sets the organization number.
        /// </summary>
        public string? Orgnr { get; set; }

        /// <summary>
        /// Gets or sets the organization's homepage URL.
        /// </summary>
        public string? Homepage { get; set; }

        /// <summary>
        /// Gets or sets the environments where the organization is available.
        /// </summary>
        public List<string>? Environments { get; set; }

        /// <summary>
        /// Gets or sets the contact information for the organization.
        /// </summary>
        public OrgContact? Contact { get; set; } // Assuming you have an OrgContact model
    }

    /// <summary>
    /// Represents organization contact information.
    /// </summary>
    public class OrgContact
    {
        /// <summary>
        /// Gets or sets the phone number.
        /// </summary>
        public string? Phone { get; set; }

        /// <summary>
        /// Gets or sets the contact URL.
        /// </summary>
        public string? Url { get; set; }
    }
}