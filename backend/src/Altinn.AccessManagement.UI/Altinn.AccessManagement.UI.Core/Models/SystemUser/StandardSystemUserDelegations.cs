using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.SystemUser
{
    /// <summary>
    /// Model for standard SystemUser right and access package delegations
    /// </summary>
    public class StandardSystemUserDelegations
    {
        /// <summary>
        /// System user id
        /// </summary>
        [JsonPropertyName("systemUserId")]
        public Guid SystemUserId { get; set; }

        /// <summary>
        /// System user rights
        /// </summary>
        [JsonPropertyName("rights")]
        public List<Right> Rights { get; set; } = new List<Right>();

        /// <summary>
        /// System user access packages
        /// </summary>
        [JsonPropertyName("accessPackages")]
        public List<RegisteredSystemAccessPackage> AccessPackages { get; set; } = new List<RegisteredSystemAccessPackage>();
    }
}