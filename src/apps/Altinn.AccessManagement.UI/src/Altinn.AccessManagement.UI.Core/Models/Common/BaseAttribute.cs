using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// This model describes an attribute, like a resource, a user, a party or an action. The attribute is defined by its type (usually a urn) and it's value.
    /// </summary>
    public class BaseAttribute
    {
        /// <summary>
        /// Defines the type of the attribute (how to evaluate the value)
        /// </summary>
        [Required]
        [JsonPropertyName("type")]
        public required string Type { get; set; }

        /// <summary>
        /// Defines the value of the attribute
        /// </summary>
        [Required]
        [JsonPropertyName("value")]
        public required string Value { get; set; }
    }
}
