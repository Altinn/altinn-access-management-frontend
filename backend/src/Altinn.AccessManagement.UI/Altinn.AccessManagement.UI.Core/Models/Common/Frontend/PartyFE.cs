using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;
using RegisterParty = Altinn.Register.Contracts.Party;
using RegisterPartyType = Altinn.Register.Contracts.PartyType;
using RegisterV1Party = Altinn.Register.Contracts.V1.Party;
using RegisterV1PartyType = Altinn.Register.Contracts.V1.PartyType;

namespace Altinn.AccessManagement.UI.Core.Models.Common.Frontend
{
    /// <summary>
    /// A person, organization or system user, as sent to the frontend.
    /// Services map their platform party models to this with the From* factories.
    /// </summary>
    public class PartyFE
    {
        /// <summary>
        /// Gets or sets the party uuid
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the party id, when known
        /// </summary>
        public int? PartyId { get; set; }

        /// <summary>
        /// Gets or sets the name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the party type
        /// </summary>
        public PartyTypeFE Type { get; set; }

        /// <summary>
        /// Gets or sets the unit type (AS, BEDR, AAFY …). Only set for organizations; subunits are recognized by it.
        /// </summary>
        public string UnitType { get; set; }

        /// <summary>
        /// Gets or sets the organization number
        /// </summary>
        public string OrganizationIdentifier { get; set; }

        /// <summary>
        /// Gets or sets the date of birth (yyyy-MM-dd)
        /// </summary>
        public string DateOfBirth { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the party is deleted
        /// </summary>
        public bool IsDeleted { get; set; }

        /// <summary>
        /// Gets or sets the child parties (subunits)
        /// </summary>
        public List<PartyFE> Children { get; set; }

        /// <summary>
        /// Gets or sets the parent party (the main unit of a subunit), when known
        /// </summary>
        public PartyFE Parent { get; set; }

        /// <summary>
        /// Maps an entity from the access management connection endpoints
        /// </summary>
        public static PartyFE FromEntity(Entity entity)
        {
            if (entity == null)
            {
                return null;
            }

            PartyTypeFE type = ParseType(entity.Type);
            return new PartyFE
            {
                Id = entity.Id,
                PartyId = entity.PartyId,
                Name = entity.Name,
                Type = type,
                UnitType = type == PartyTypeFE.Organization ? entity.Variant : null,
                OrganizationIdentifier = entity.OrganizationIdentifier,
                DateOfBirth = entity.DateOfBirth,
                IsDeleted = entity.IsDeleted,
                Children = entity.Children?.Select(FromEntity).ToList(),
                Parent = FromEntity(entity.Parent),
            };
        }

        /// <summary>
        /// Maps a compact entity from the access management permission endpoints
        /// </summary>
        public static PartyFE FromCompactEntity(CompactEntity entity)
        {
            if (entity == null)
            {
                return null;
            }

            PartyTypeFE type = ParseType(entity.Type);
            return new PartyFE
            {
                Id = entity.Id,
                PartyId = entity.PartyId,
                Name = entity.Name,
                Type = type,
                UnitType = type == PartyTypeFE.Organization ? entity.Variant : null,
                OrganizationIdentifier = entity.OrganizationIdentifier,
                DateOfBirth = entity.DateOfBirth,
                IsDeleted = entity.IsDeleted,
                Children = entity.Children?.Select(FromCompactEntity).ToList(),
                Parent = FromCompactEntity(entity.Parent),
            };
        }

        /// <summary>
        /// Maps a simplified party from the limited instance delegation endpoints
        /// </summary>
        public static PartyFE FromSimplifiedParty(SimplifiedParty party)
        {
            if (party == null)
            {
                return null;
            }

            PartyTypeFE type = ParseType(party.Type);
            return new PartyFE
            {
                Id = party.Id,
                Name = party.Name,
                Type = type,
                UnitType = type == PartyTypeFE.Organization ? party.Variant : null,
                OrganizationIdentifier = party.OrganizationIdentifier,
                IsDeleted = party.IsDeleted,
            };
        }

        /// <summary>
        /// Maps a Register V1 party
        /// </summary>
        public static PartyFE FromRegisterParty(RegisterV1Party party)
        {
            if (party == null)
            {
                return null;
            }

            PartyTypeFE type = party.PartyTypeName switch
            {
                RegisterV1PartyType.Organisation or RegisterV1PartyType.SubUnit or RegisterV1PartyType.BankruptcyEstate => PartyTypeFE.Organization,
                RegisterV1PartyType.SelfIdentified => PartyTypeFE.SelfIdentified,
                _ => PartyTypeFE.Person,
            };

            return new PartyFE
            {
                Id = party.PartyUuid ?? Guid.Empty,
                PartyId = party.PartyId,
                Name = party.Name,
                Type = type,
                UnitType = type == PartyTypeFE.Organization ? party.UnitType : null,
                OrganizationIdentifier = party.OrgNumber,
                IsDeleted = party.IsDeleted,
                Children = party.ChildParties?.Select(FromRegisterParty).ToList(),
            };
        }

        /// <summary>
        /// Maps a Register party (the polymorphic model in Register.Contracts)
        /// </summary>
        public static PartyFE FromRegisterParty(RegisterParty party)
        {
            if (party == null)
            {
                return null;
            }

            var partyFE = new PartyFE
            {
                Id = party.Uuid,
                PartyId = party.PartyId.HasValue ? (int)party.PartyId.Value : null,
                Name = party.DisplayName.HasValue ? party.DisplayName.Value : null,
                Type = !party.Type.IsWellKnown ? PartyTypeFE.Person : party.Type.Value switch
                {
                    RegisterPartyType.Organization => PartyTypeFE.Organization,
                    RegisterPartyType.SystemUser => PartyTypeFE.SystemUser,
                    RegisterPartyType.SelfIdentifiedUser => PartyTypeFE.SelfIdentified,
                    _ => PartyTypeFE.Person,
                },
                IsDeleted = party.IsDeleted.HasValue && party.IsDeleted.Value,
            };

            if (party is Altinn.Register.Contracts.Organization organization)
            {
                partyFE.OrganizationIdentifier = organization.OrganizationIdentifier?.ToString();
                partyFE.UnitType = organization.UnitType.HasValue ? organization.UnitType.Value : null;
            }
            else if (party is Altinn.Register.Contracts.Person person && person.DateOfBirth.HasValue)
            {
                partyFE.DateOfBirth = person.DateOfBirth.Value.ToString("yyyy-MM-dd");
            }

            return partyFE;
        }

        /// <summary>
        /// Copies the party fields from an authorized party. Used by <see cref="AuthorizedPartyFE"/>.
        /// </summary>
        protected static void CopyFrom(AuthorizedParty party, PartyFE target)
        {
            PartyTypeFE type = party.Type switch
            {
                AuthorizedPartyType.Organization => PartyTypeFE.Organization,
                AuthorizedPartyType.SelfIdentified => PartyTypeFE.SelfIdentified,
                _ => PartyTypeFE.Person,
            };

            target.Id = party.PartyUuid;
            target.PartyId = party.PartyId;
            target.Name = party.Name;
            target.Type = type;
            target.UnitType = type == PartyTypeFE.Organization ? party.UnitType : null;
            target.OrganizationIdentifier = party.OrganizationNumber;
            target.DateOfBirth = party.DateOfBirth;
            target.IsDeleted = party.IsDeleted;
        }

        /// <summary>
        /// Parses the party type strings used by the access management platform.
        /// Accepts both Norwegian and English names, case-insensitively. Unknown values fall back to Person.
        /// </summary>
        internal static PartyTypeFE ParseType(string type)
        {
            switch (type?.Trim().ToLowerInvariant())
            {
                case "organisasjon":
                case "organization":
                case "organisation":
                    return PartyTypeFE.Organization;
                case "systembruker":
                case "systemuser":
                    return PartyTypeFE.SystemUser;
                case "selvidentifisert":
                case "selfidentified":
                case "selfidentifieduser":
                    return PartyTypeFE.SelfIdentified;
                default:
                    return PartyTypeFE.Person;
            }
        }
    }
}
