namespace Altinn.AccessManagement.UI.Core.Models.User
{
    /// <summary>
    /// Simplified party information returned by the limited connections endpoints.
    /// Used when the caller has isClientAdmin but not isAdmin.
    /// </summary>
    public class SimplifiedParty
    {
        /// <summary>
        /// Gets or sets the unique identifier for the party.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the party.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the type of party (Person, Organization, etc.).
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets the variant/subtype of the party.
        /// </summary>
        public string Variant { get; set; }

        /// <summary>
        /// Gets or sets the organization number (only for organizations).
        /// </summary>
        public string OrganizationIdentifier { get; set; }

        /// <summary>
        /// Gets or sets whether the party is deleted.
        /// </summary>
        public bool IsDeleted { get; set; }
    }
}
