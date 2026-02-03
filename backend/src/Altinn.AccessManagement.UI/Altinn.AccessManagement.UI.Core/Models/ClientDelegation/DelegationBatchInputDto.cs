using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation
{
    /// <summary>
    /// Batch input for delegating access packages to an agent.
    /// </summary>
    public class DelegationBatchInputDto
    {
        /// <summary>
        /// Gets or sets the delegation values.
        /// </summary>
        [JsonPropertyName("values")]
        public List<Permission> Values { get; set; } = new();

        /// <summary>
        /// Permission input for a role and packages.
        /// </summary>
        public class Permission
        {
            /// <summary>
            /// Gets or sets the role code.
            /// </summary>
            [JsonPropertyName("role")]
            public string Role { get; set; }

            /// <summary>
            /// Gets or sets the package identifiers.
            /// </summary>
            [JsonPropertyName("packages")]
            public List<string> Packages { get; set; } = new();
        }
    }
}
