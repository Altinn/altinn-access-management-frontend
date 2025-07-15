using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client wrapper for integration with profile endpoints in access management component
    /// </summary>
    public interface IAltinnCdnClient
    {
        /// <summary>
        /// Retrieves organization data from the CDN.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a dictionary with organization data.</returns>
        Task<Dictionary<string, OrgData>> GetOrgData();
    }
}
