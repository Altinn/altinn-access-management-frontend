using Altinn.AccessManagement.UI.Core.Enums;
using Microsoft.Identity.Client;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// An area for grouping similar types of roles
    /// </summary>
    public class DelegationCheckResponse
    {
        /// <summary>
        /// True if the user can delegate the role
        /// </summary>
        public bool CanDelegate { get; set; }

        /// <summary>
        /// The error code if the user cannot delegate the role
        /// </summary>
        public DetailCode? DetailCode { get; set; } 
    }
}
