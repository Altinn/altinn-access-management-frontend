using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

namespace Altinn.AccessManagement.UI.Core.Models.User
{
    /// <summary>
    /// A person or entity with delegable rights or power of attorney.
    /// </summary>
    public class User
    {
        /// <summary>
        /// The universally unique identifier of the RightHolder party
        /// </summary>
        public Guid PartyUuid { get; set; }

        /// <summary>
        /// The type of Party (person, org, etc.)
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
        /// The organization number if the party is an organization
        /// </summary>
        public string OrganizationNumber { get; set; }

        /// <summary>
        /// The unit type if the party is an organization
        /// </summary>
        public string UnitType { get; set; }

        /// <summary>
        /// Key persons inheriting rights from the organization
        /// </summary>
        public List<User> InheritingUsers { get; set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        public User()
        {
        }

        /// <summary>
        /// Mapping from AuthorizedParty
        /// </summary>
        public User(AuthorizedParty party)
        {
            PartyUuid = party.PartyUuid;
            PartyType = party.Type;
            Name = party.Name;
            OrganizationNumber = party.OrganizationNumber;
            UnitType = party.UnitType;
            RegistryRoles = party.AuthorizedRoles.Where(role => Enum.IsDefined(typeof(RegistryRoleType), role.ToUpper()))
                .Select(role => (RegistryRoleType)Enum.Parse(typeof(RegistryRoleType), role.ToUpper()))
                .ToList();
            InheritingUsers = party.Subunits.Select(unit => new User(unit)).ToList();
        }
    }
}
