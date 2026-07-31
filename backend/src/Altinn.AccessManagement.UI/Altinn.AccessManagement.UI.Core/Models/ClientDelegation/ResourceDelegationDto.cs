using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation
{
    /// <summary>
    /// Delegation details for a single rights resource assignment.
    /// </summary>
    public class ResourceDelegationDto
    {
        /// <summary>
        /// Gets or sets the role id.
        /// </summary>
        [JsonPropertyName("roleId")]
        public Guid RoleId { get; set; }

        /// <summary>
        /// Gets or sets the internal resource id.
        /// </summary>
        [JsonPropertyName("resourceId")]
        public Guid ResourceId { get; set; }

        /// <summary>
        /// Gets or sets the via id.
        /// </summary>
        [JsonPropertyName("viaId")]
        public Guid ViaId { get; set; }

        /// <summary>
        /// Gets or sets the delegating party id.
        /// </summary>
        [JsonPropertyName("fromId")]
        public Guid FromId { get; set; }

        /// <summary>
        /// Gets or sets the receiving party id.
        /// </summary>
        [JsonPropertyName("toId")]
        public Guid ToId { get; set; }
    }
}
