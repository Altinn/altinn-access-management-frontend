using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// Class representing a person for use in GUI (equal to the definition of regitry but without ssn)
    /// </summary>
    public class PersonFE
    {
        /// <summary>
        /// Gets a persons name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the first name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Gets or sets the middle name
        /// </summary>
        public string MiddleName { get; set; }

        /// <summary>
        /// Gets or sets the last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Gets a persons telephone number
        /// </summary>
        public string TelephoneNumber { get; set; }

        /// <summary>
        /// Gets a persons mobile number
        /// </summary>
        public string MobileNumber { get; set; }

        /// <summary>
        /// Gets a persons mailing address
        /// </summary>
        public string MailingAddress { get; set; }

        /// <summary>
        /// Gets a persons mailing postal code
        /// </summary>
        public string MailingPostalCode { get; set; }

        /// <summary>
        /// Gets a persons mailing postal city
        /// </summary>
        public string MailingPostalCity { get; set; }

        /// <summary>
        /// Gets a persons address municipal number
        /// </summary>
        public string AddressMunicipalNumber { get; set; }

        /// <summary>
        /// Gets a persons address municipal name
        /// </summary>
        public string AddressMunicipalName { get; set; }

        /// <summary>
        /// Gets a persons address street name
        /// </summary>
        public string AddressStreetName { get; set; }

        /// <summary>
        /// Gets a persons address house number
        /// </summary>
        public string AddressHouseNumber { get; set; }

        /// <summary>
        /// Gets a persons address house letter
        /// </summary>
        public string AddressHouseLetter { get; set; }

        /// <summary>
        /// Gets a persons address postal code
        /// </summary>
        public string AddressPostalCode { get; set; }

        /// <summary>
        /// Gets a persons address city
        /// </summary>
        public string AddressCity { get; set; }

        /// <summary>
        /// Gets a persons date of death. Null if not dead.
        /// </summary>
        public DateTime? DateOfDeath { get; set; }

        /// <summary>
        /// Creates a PersonFE object from a Person object
        /// </summary>
        /// <param name="person">A Person object</param>
        public PersonFE(Person person)
        {
            Name = person.Name;
            FirstName = person.FirstName;
            MiddleName = person.MiddleName;
            LastName = person.LastName;
            TelephoneNumber = person.TelephoneNumber;
            MobileNumber = person.MobileNumber;
            MailingAddress = person.MailingAddress;
            MailingPostalCode = person.MailingPostalCode;
            MailingPostalCity = person.MailingPostalCity;
            AddressCity = person.AddressCity;
            AddressMunicipalName = person.AddressMunicipalName;
            AddressMunicipalNumber = person.AddressMunicipalNumber;
            AddressStreetName = person.AddressStreetName;
            AddressHouseNumber = person.AddressHouseNumber;
            AddressHouseLetter = person.AddressHouseLetter;
            AddressPostalCode = person.AddressPostalCode;
            DateOfDeath = person.DateOfDeath;
        }
    }
}
