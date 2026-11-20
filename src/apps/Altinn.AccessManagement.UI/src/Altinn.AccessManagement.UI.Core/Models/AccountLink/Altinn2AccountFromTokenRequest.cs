using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser
{
    /// <summary>
    /// Request model for connecting a legacy Altinn 2 user account from token.
    /// </summary>
    public class Altinn2AccountFromTokenRequest
    {
        /// <summary>
        /// The token.
        /// </summary>
        [Required]
        public string Token { get; set; }
    }
}
