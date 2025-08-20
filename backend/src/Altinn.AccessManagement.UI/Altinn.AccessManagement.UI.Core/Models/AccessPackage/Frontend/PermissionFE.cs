using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend
{
    /// <summary>
    /// Access packages frontend model
    /// </summary>
    public class PermissionFE
    {
        /// <summary>
        /// From party
        /// </summary>
        public CompactEntity From { get; set; }

        /// <summary>
        /// To party
        /// </summary>
        public CompactEntity To { get; set; }

        /// <summary>
        /// RoleCodes
        /// </summary>
        public List<string> RoleCodes { get; set; }
    }
}