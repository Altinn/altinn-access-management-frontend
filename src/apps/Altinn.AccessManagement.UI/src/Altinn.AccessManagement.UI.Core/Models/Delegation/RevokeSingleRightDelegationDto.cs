using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// Represents the data transfer object for revoking a single right delegation.
    /// </summary>
    public class RevokeSingleRightDelegationDTO
    {
        /// <summary>
        /// Gets or sets the user ID.
        /// </summary>
        [Required]
        public string UserId { get; set; }

        /// <summary>
        /// Gets or sets the resource ID.
        /// </summary>
        [Required]
        public string ResourceId { get; set; }
    }
}