using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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
        public PersonInputDto To { get; set; }

        /// <summary>
        /// Gets or sets the right keys to delegate on the instance.
        /// </summary>
        [Required]
        [JsonPropertyName("directRightKeys")]
        public List<string> DirectRightKeys { get; set; } = [];
    }

    /// <summary>
    /// Person input used when creating a new rightholder connection as part of instance delegation.
    /// </summary>
    public class PersonInputDto
    {
        /// <summary>
        /// Gets or sets the person identifier.
        /// </summary>
        [Required]
        [JsonPropertyName("personIdentifier")]
        public string PersonIdentifier { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the person's last name.
        /// </summary>
        [Required]
        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;
    }
}
