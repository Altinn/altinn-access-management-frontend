using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser
{
    /// <summary>
    /// Request model for sending a forgot password email for a legacy Altinn 2 user account.
    /// </summary>
    public class Altinn2ForgotPasswordRequest
    {
        /// <summary>
        /// The legacy account username.
        /// </summary>
        [Required]
        public string UserName { get; set; }
    }
}
