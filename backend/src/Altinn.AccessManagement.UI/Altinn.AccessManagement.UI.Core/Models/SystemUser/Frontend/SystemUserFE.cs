using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// The model of the System User response given in the CRUD API in SystemUserController.cs
    /// This model will be exchanged between this Authentication component, the PostGress db and the BFF for the Frontend.
    /// The BFF will provide a tailored DTO to the Frontend.
    /// The Altinn URN is: urn:altinn:systemuser:uuid
    /// </summary>
    public class SystemUserFE
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
        /// The PartyID identifies the end-user Organisation, and is fetched from the login Context and
        /// user party serivces
        /// </summary>
        [JsonPropertyName("partyId")]
        public string PartyId { get; set; } = string.Empty;

        /// <summary>
        /// Nice to have for debugging and logging.
        /// </summary>
        [JsonPropertyName("created")]
        public DateTime Created { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// System information from the system register
        /// </summary>
        [JsonPropertyName("system")]
        public RegisteredSystemFE System { get; set; }

        /// <summary>
        /// Either Agent or Default
        /// </summary>
        [JsonPropertyName("systemUserType")]
        public string SystemUserType { get; set; }

        /// <summary>
        /// List of resources information
        /// </summary>
        [JsonPropertyName("resources")]
        public List<ServiceResourceFE> Resources { get; set; } = new List<ServiceResourceFE>();

        /// <summary>
        /// List of access package information (with resources)
        /// </summary>
        [JsonPropertyName("accessPackages")]
        public List<AccessPackageFE> AccessPackages { get; set; } = new List<AccessPackageFE>();
    }
}