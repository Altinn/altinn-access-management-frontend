using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend
{
    /// <summary>
    /// A right with its reason and the permissions that give it, as sent to the frontend
    /// </summary>
    public class RightAccessFE
    {
        /// <summary>
        /// Gets or sets the right definition
        /// </summary>
        public Right Right { get; set; }

        /// <summary>
        /// Gets or sets the reason for the right
        /// </summary>
        public Reason Reason { get; set; }

        /// <summary>
        /// Gets or sets the permissions that give the right
        /// </summary>
        public List<PermissionFE> Permissions { get; set; } = new();

        /// <summary>
        /// Maps a right access from the access management rights endpoints
        /// </summary>
        public static RightAccessFE FromRightAccess(RightAccess rightAccess)
        {
            if (rightAccess == null)
            {
                return null;
            }

            return new RightAccessFE
            {
                Right = rightAccess.Right,
                Reason = rightAccess.Reason,
                Permissions = PermissionFE.FromPermissions(rightAccess.Permissions),
            };
        }

        /// <summary>
        /// Maps a list of right accesses, treating null as empty
        /// </summary>
        public static List<RightAccessFE> FromRightAccesses(IEnumerable<RightAccess> rightAccesses)
        {
            return rightAccesses?.Select(FromRightAccess).ToList() ?? new();
        }
    }
}
