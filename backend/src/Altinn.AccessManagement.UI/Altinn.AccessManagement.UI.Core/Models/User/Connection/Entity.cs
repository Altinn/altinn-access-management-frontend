namespace Altinn.AccessManagement.UI.Core.Models.User
{
    /// <summary>
    /// Represents a party involved in a delegation (From, To, Facilitator).
    /// Contains identifying and descriptive information about the party.
    /// </summary>
    public class Entity
    {
        /// <summary>
        /// Gets or sets id.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets type.
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets variant.
        /// </summary>
        public string Variant { get; set; }

        /// <summary>
        /// Gets or sets parent.
        /// </summary>
        public Entity Parent { get; set; }

        /// <summary>
        /// Gets or sets children.
        /// Sub-units - only if org.
        /// </summary>
        public List<Entity> Children { get; set; }

        /// <summary>
        /// Gets or sets party id in Altinn 2/3.
        /// </summary>
        public int? PartyId { get; set; }

        /// <summary>
        /// Gets or sets organization identifier when the entity is an organization.
        /// </summary>
        public string OrganizationIdentifier { get; set; }

        /// <summary>
        /// Gets or sets date of birth for persons.
        /// </summary>
        public string DateOfBirth { get; set; }
    }
}
