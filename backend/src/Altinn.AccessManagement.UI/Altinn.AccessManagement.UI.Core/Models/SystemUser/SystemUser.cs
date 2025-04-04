using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// The model of the System User response given in the CRUD API in SystemUserController.cs
    /// This model will be exchanged between this Authentication component, the PostGress db and the BFF for the Frontend.
    /// The BFF will provide a tailored DTO to the Frontend.
    /// The Altinn URN is: urn:altinn:systemuser:uuid
    /// </summary>
    public class SystemUser
    {
        /// <summary>
        /// GUID created by the "real" Authentication Component
        /// When the Frontend send a request for the creation of a new SystemUser the Id is null
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// The Title is by default the same as the System's Display Name
        /// </summary>
        [JsonPropertyName("integrationTitle")]
        public string IntegrationTitle { get; set; }

        /// <summary>
        /// Identifier for off the shelf systems, registered in the SystemRegister db.
        /// Should be human readable (instead of a GUID) and unique string without whitespace.                
        /// </summary>
        [JsonPropertyName("systemId")]
        public string SystemId { get; set; } = string.Empty;

        /// <summary>
        /// The underlying identifier for the System for persistance in the db.        
        /// </summary>
        [JsonPropertyName("systemInternalId")]
        public Guid? SystemInternalId { get; set; }

        /// <summary>
        /// The PartyID identifies the end-user Organisation, and is fetched from the login Context and
        /// user party serivces
        /// </summary>
        [JsonPropertyName("partyId")]
        public string PartyId { get; set; } = string.Empty;

        /// <summary>
        /// The Organisation Number for the end-user as it is stored in ER Registry        
        /// </summary>
        [JsonPropertyName("reporteeOrgNo")]
        public string ReporteeOrgNo { get; set; } = string.Empty;

        /// <summary>
        /// Nice to have for debugging and logging.
        /// </summary>
        [JsonPropertyName("created")]
        public DateTime Created { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// The organization number for the Supplier of the Product 
        /// In later phases, it will be possible to use non-supplier based Products, in which case the ClientId property should be filled out.
        /// </summary>
        [JsonPropertyName("supplierOrgno")]
        public string SupplierOrgNo { get; set; } = string.Empty;

        /// <summary>
        /// The External Reference is provided by the Vendor, and is used to identify their Customer in the Vendor's system.
        /// </summary>
        [JsonPropertyName("externalRef")]
        public string ExternalRef { get; set; } = string.Empty;

        /// <summary>
        /// Either Agent or Default
        /// </summary>
        [JsonPropertyName("systemUserType")]
        public string SystemUserType { get; set; }

        /// <summary>
        /// Access packages set on the system user
        /// </summary>
        [JsonPropertyName("accessPackages")]
        public List<RegisteredSystemAccessPackage> AccessPackages { get; set; } = [];
    }
}