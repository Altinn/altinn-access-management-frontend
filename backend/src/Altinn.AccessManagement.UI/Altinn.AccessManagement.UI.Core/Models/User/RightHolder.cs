using Altinn.AccessManagement.UI.Core.Enums;

namespace Altinn.AccessManagement.UI.Core.Models.User
{
    public class RightHolder
    {
        /// <summary>
        /// The universally unique identifier of the RightHolder party
        /// </summary>
        public Guid PartyUuid { get; set; }

        /// <summary>
        /// The type of Party (person, org, etc)
        /// </summary>
        public AuthorizedPartyType PartyType { get; set; }

        /// <summary>
        /// The name of the right holder
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The roles gotten from Enhetsregisteret
        /// </summary>
        public List<RegistryRoleType> RegistryRoles { get; set; }

        /// <summary>
        /// The national identity number if the party is a person
        /// </summary>
        public string PersonId { get; set; }

        /// <summary>
        /// The organization number if the party is an organization
        /// </summary>
        public string OrganizationNumber { get; set; }

        /// <summary>
        /// The unit type if the party is an organization
        /// </summary>
        public string UnitType { get; set; }

    }
}
