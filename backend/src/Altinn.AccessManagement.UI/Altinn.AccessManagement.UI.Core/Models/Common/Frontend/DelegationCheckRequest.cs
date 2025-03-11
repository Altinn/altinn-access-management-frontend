using Altinn.AccessManagement.UI.Core.Enums;
using Microsoft.Identity.Client;

namespace Altinn.AccessManagement.UI.Core.Models
{
    /// <summary>
    /// The response of a delegation check
    /// </summary>
    public class DelegationCheckRequest
    {
        /// <summary>
        /// A list of packages to check if the user can delegate
        /// </summary>
        public Guid[] PackageIds { get; set; }

        /// <summary>
        /// The id of the reportee to check if the user can delegate on behalf of
        /// </summary>
        public Guid ReporteeUuid { get; set; } 
    }
}
