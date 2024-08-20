using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    ///     Represents the data transfer object for revoking an offered or received delegation.
    /// </summary>
    public class RevokeDelegationDTO
    {
        /// <summary>
        ///     Gets or sets the organization number.
        /// </summary>
        [Required]
        public string OrgNr { get; set; }

        /// <summary>
        ///     Gets or sets the API identifier.
        /// </summary>
        [Required]
        public string ApiId { get; set; }
    }

}
