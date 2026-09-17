#nullable enable

using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for Altinn CDN service that provides methods to retrieve organization data.
    /// </summary>
    public interface IAltinnCdnService
    {
        /// <summary>
        /// Retrieves organization data from the Altinn CDN.
        /// </summary>
        /// <remarks>
        /// Never throws: when the CDN cannot be reached, the last successfully fetched data is
        /// returned, or an empty dictionary if nothing has been fetched yet. Use
        /// <see cref="GetOrgDataSnapshot"/> when the caller needs to know which of those it got.
        /// </remarks>
        /// <returns>A dictionary containing organization data, where the key is the organization code and the value is the <see cref="OrgData"/> object.</returns>
        Task<Dictionary<string, OrgData>> GetOrgData();

        /// <summary>
        /// Retrieves organization data from the Altinn CDN along with how current it is.
        /// </summary>
        /// <returns>The organization data and its <see cref="OrgDataAvailability"/>.</returns>
        Task<OrgDataSnapshot> GetOrgDataSnapshot();
    }
}
