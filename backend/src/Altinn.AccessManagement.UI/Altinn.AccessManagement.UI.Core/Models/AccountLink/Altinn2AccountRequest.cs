using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser
{
    /// <summary>
    /// Request model for connecting a legacy Altinn 2 user account.
    /// </summary>
    public class Altinn2AccountRequest
    {
        /// <summary>
        /// The legacy account username.
        /// </summary>
        [Required]
        public string Username { get; set; }

        /// <summary>
        /// The legacy account password.
        /// </summary>
        [Required]
        public string Password { get; set; }
    }
}
