using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto
{
    /// <summary>
    ///     Checks whether the user can delegate the given right to the given party
    /// </summary>
    public class CheckDelegationAccessDto
    {
        /// <summary>
        ///     Used to identify the party the authenticated user is acting on behalf of.
        /// </summary>
        [Required]
        public To To { get; set; }

        /// <summary>
        ///     The delegation acccess check request object that's going to be consumed by the backend
        /// </summary>
        [Required]
        public Resource Resource { get; set; }
    }
}
