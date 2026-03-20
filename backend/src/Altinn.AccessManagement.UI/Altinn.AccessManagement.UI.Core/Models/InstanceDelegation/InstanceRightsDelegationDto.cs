using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.Models.Connections;

namespace Altinn.AccessManagement.UI.Core.Models.InstanceDelegation
{
    /// <summary>
    /// Input model for delegating rights on an instance.
    /// Supports both existing recipients and creating a new person recipient in the same request.
    /// </summary>
    public class InstanceRightsDelegationDto
    {
        /// <summary>
        /// Gets or sets the target person input used when creating a new rightholder connection.
        /// Mutually exclusive with the <c>to</c> query parameter.
        /// </summary>
        [JsonPropertyName("to")]
        public PersonInput To { get; set; }

        /// <summary>
        /// Gets or sets the right keys to delegate on the instance.
        /// </summary>
        [Required]
        [MinLength(1, ErrorMessage = "At least one right must be delegated.")]
        [JsonPropertyName("directRightKeys")]
        public List<string> DirectRightKeys { get; set; } = [];
    }
}
