using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// The model of the System User response given in the CRUD API in SystemUserController
    /// </summary>
    public class SystemUserCreateResponseFE
    {
        /// <summary>
        /// GUID created by the "real" Authentication Component
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
    }
}