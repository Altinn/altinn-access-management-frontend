using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Fields for updating a SystemUser
    /// </summary>
    public class SystemUserUpdate
    {
        /// <summary>
        /// The Title is by default the same as the System's Display Name
        /// </summary>
        [JsonPropertyName("integrationTitle")]
        public string IntegrationTitle { get; set; }
    }
}