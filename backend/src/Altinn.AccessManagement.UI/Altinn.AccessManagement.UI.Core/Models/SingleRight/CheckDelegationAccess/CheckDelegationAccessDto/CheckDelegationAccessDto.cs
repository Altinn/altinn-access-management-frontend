using System.ComponentModel.DataAnnotations;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto
{
    /// <summary>
    ///     Checks whether the user can delegate the given right to the given party
    /// </summary>
    /// <param name="To">
    ///     Used to identify the party the authenticated user is acting on behalf of./param>
    ///     <param name="Resources">The delegation acccess check request object that's going to be consumed by the backend</param>
    ///     <returns></returns>
    public class CheckDelegationAccessDto
    {
        /// <summary>
        ///     The To object used for delegation acccess check request object that's going to be consumed by the backend
        /// </summary>
        /// <param name="To">
        ///     Used to identify the party the authenticated user is acting on behalf of./param>
        ///     <returns></returns>
        [Required]
        public To To { get; set; }

        /// <summary>
        ///     The Resource object for delegation acccess check request object that's going to be consumed by the backend
        /// </summary>
        /// <param name="Resource">The delegation acccess check request object that's going to be consumed by the backend</param>
        /// <returns></returns>
        [Required]
        public Resource Resource { get; set; }
    }
}
