using Altinn.Register.Contracts.V1;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// Class representing a party for use in GUI (equal to the one from registry but without ssn)
    /// </summary>
    public class PartyFE
    {
        /// <summary>
        /// Gets or sets the ID of the party
        /// </summary>
        public int PartyId { get; set; }

        /// <summary>
        /// Gets or sets the UUID of the party
        /// </summary>
        public Guid? PartyUuid { get; set; }

        /// <summary>
        /// Gets or sets the type of party
        /// </summary>
        public PartyType PartyTypeName { get; set; }

        /// <summary>
        /// Gets the parties org number
        /// </summary>
        public string OrgNumber { get; set; }

        /// <summary>
        /// Gets or sets the UnitType
        /// </summary>
        public string UnitType { get; set; }

        /// <summary>
        /// Gets or sets the Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the IsDeleted
        /// </summary>
        public bool IsDeleted { get; set; }

        /// <summary>
        /// Gets or sets the DateOfBirth
        /// </summary>
        public DateOnly? DateOfBirth { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether if the reportee in the list is only there for showing the hierarchy (a parent unit with no access)
        /// </summary>
        public bool OnlyHierarchyElementWithNoAccess { get; set; }

        /// <summary>
        /// Gets or sets the person details for this party (will only be set if the party type is Person)
        /// </summary>
        public PersonFE Person { get; set; }

        /// <summary>
        /// Gets or sets the organization details for this party (will only be set if the party type is Organization)
        /// </summary>
        public Organization Organization { get; set; }

        /// <summary>
        /// Gets or sets the value of ChildParties
        /// </summary>
        public List<PartyFE> ChildParties { get; set; }

        /// <summary>
        /// Creates a PartyFE object from a Party object
        /// </summary>
        /// <param name="party">A Party object</param>
        public PartyFE(Party party)
        {
            PartyId = party.PartyId;
            PartyUuid = party.PartyUuid;
            PartyTypeName = (PartyType)party.PartyTypeName;
            Name = party.Name;
            IsDeleted = party.IsDeleted;
            OrgNumber = party.OrgNumber;
            UnitType = party.UnitType;
            OnlyHierarchyElementWithNoAccess = party.OnlyHierarchyElementWithNoAccess;
            Person = party.Person == null ? null : new PersonFE(party.Person);
            Organization = party.Organization;
            ChildParties = party.ChildParties == null ? null : MakeChildPartyFEList(party?.ChildParties.ToList());
        }

        /// <summary>
        /// Creates a PartyFE object from the new Party model in Register.Contracts
        /// </summary>
        /// <param name="party">A polymorphic Party object</param>
        public PartyFE(Altinn.Register.Contracts.Party party)
        {
            PartyId = party.PartyId.HasValue ? (int)party.PartyId.Value : 0;
            PartyUuid = party.Uuid;
            PartyTypeName = party.Type.IsWellKnown ? (PartyType)party.Type.Value : PartyType.Person;
            Name = (string)party.DisplayName;
            IsDeleted = (bool)party.IsDeleted;
            if (party is Altinn.Register.Contracts.Organization organization)
            {
                OrgNumber = organization.OrganizationIdentifier.ToString();
                UnitType = organization.UnitType.ToString();
                Organization = new Altinn.Register.Contracts.V1.Organization
                {
                    OrgNumber = organization.OrganizationIdentifier.ToString(),
                    Name = organization.DisplayName.ToString(),
                    UnitType = organization.UnitType.ToString(),
                    TelephoneNumber = organization.TelephoneNumber.ToString(),
                    MobileNumber = organization.MobileNumber.ToString(),
                    FaxNumber = organization.FaxNumber.ToString(),
                    EMailAddress = organization.EmailAddress.ToString(),
                    InternetAddress = organization.InternetAddress.ToString(),
                    MailingAddress = organization.MailingAddress.ToString(),
                    BusinessAddress = organization.BusinessAddress.ToString(),
                    UnitStatus = organization.UnitStatus.ToString()
                };
            }
            else if (party is Altinn.Register.Contracts.Person person)
            {
                DateOfBirth = person.DateOfBirth.IsNull ? null : person.DateOfBirth.Value;
            }
        }

        /// <summary>
        /// Default contructor
        /// </summary>
        public PartyFE()
        {
        }

        private List<PartyFE> MakeChildPartyFEList(List<Party> childParties)
        {
            List<PartyFE> childPartiesFE = new List<PartyFE>();

            foreach (Party childParty in childParties)
            {
                childPartiesFE.Add(new PartyFE(childParty));
            }

            return childPartiesFE;
        }
    }
}
