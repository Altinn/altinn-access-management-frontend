using Altinn.AccessManagement.UI.Core.Enums;
using Microsoft.Identity.Client;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// The response of a delegation check
    /// </summary>
    public class AccessPackageDelegationCheckResponse
    {
        /// <summary> 
        /// The package id that was checked
        /// </summary>
        public Guid PackageId { get; set; }

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
