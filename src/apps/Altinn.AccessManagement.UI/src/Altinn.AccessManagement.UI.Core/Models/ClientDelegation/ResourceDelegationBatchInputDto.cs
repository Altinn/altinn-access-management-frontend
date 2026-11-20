using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation
{
    /// <summary>
    /// Batch input for delegating single rights resources to an agent.
    /// </summary>
    public class ResourceDelegationBatchInputDto
    {
        /// <summary>
        /// Gets or sets the delegation values.
        /// </summary>
        [JsonPropertyName("values")]
        public List<Permission> Values { get; set; } = new();

        /// <summary>
        /// Permission input for a role and resources.
        /// </summary>
        public class Permission
        {
            /// <summary>
            /// Gets or sets the role code.
            /// </summary>
            [JsonPropertyName("role")]
            public string Role { get; set; }

            /// <summary>
            /// Gets or sets the resource registry ids. Matched exactly against the resource RefId.
            /// </summary>
            [JsonPropertyName("resources")]
            public List<string> Resources { get; set; } = new();
        }
    }
}
