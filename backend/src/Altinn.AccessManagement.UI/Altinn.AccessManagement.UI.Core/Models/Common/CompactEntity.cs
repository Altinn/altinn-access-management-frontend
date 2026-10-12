using Altinn.AccessManagement.UI.Core.Models.User;

namespace Altinn.AccessManagement.UI.Core.Models.Common
{
    /// <summary>
    /// Compact Entity Model
    /// </summary>
    public class CompactEntity
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
        /// Type
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Variant
        /// </summary>
        public string Variant { get; set; }

        /// <summary>
        /// Parent
        /// </summary>
        public CompactEntity Parent { get; set; }

        /// <summary>
        /// Children
        /// </summary>
        public List<CompactEntity> Children { get; set; }

        /// <summary>
        /// Party id in Altinn 2/3.
        /// </summary>
        public int? PartyId { get; set; }

        /// <summary>
        /// User id.
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>
        /// Username.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Organization identifier (orgnr) when entity is an organization.
        /// </summary>
        public string OrganizationIdentifier { get; set; }

        /// <summary>
        /// Date of birth for persons.
        /// </summary>
        public string DateOfBirth { get; set; }

        /// <summary>
        /// Date of death for persons.
        /// </summary>
        public string DateOfDeath { get; set; }

        /// <summary>
        /// Indicates if the entity is deleted.
        /// </summary>
        public bool IsDeleted { get; set; }

        /// <summary>
        /// Timestamp when the entity was deleted.
        /// </summary>
        public DateTime? DeletedAt { get; set; }
    }
}
