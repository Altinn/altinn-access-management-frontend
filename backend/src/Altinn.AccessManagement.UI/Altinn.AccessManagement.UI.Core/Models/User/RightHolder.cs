using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

namespace Altinn.AccessManagement.UI.Core.Models.User
{
    /// <summary>
    /// Someone who holds some kind of right/power of atturney for someone else
    /// </summary>
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

        /// <summary>
        /// Key persons inheriting rights from the organization
        /// </summary>
        public List<RightHolder> InheritingRightHolders { get; set; }

        /// <summary>
        /// Mapping from AuthorizedParty
        /// </summary>
        public RightHolder(AuthorizedParty party)
        {
            PartyUuid = party.PartyUuid;
            PartyType = party.Type;
            Name = party.Name;
            PersonId = party.PersonId;
            OrganizationNumber = party.OrganizationNumber;
            UnitType = party.UnitType;
            RegistryRoles = party.AuthorizedRoles.Where(role => Enum.IsDefined(typeof(RegistryRoleType), role.ToUpper()))
                .Select(role => (RegistryRoleType)Enum.Parse(typeof(RegistryRoleType), role.ToUpper()))
                .ToList();
            InheritingRightHolders = party.Subunits.Select(unit => new RightHolder(unit)).ToList();
        }
    }
}
