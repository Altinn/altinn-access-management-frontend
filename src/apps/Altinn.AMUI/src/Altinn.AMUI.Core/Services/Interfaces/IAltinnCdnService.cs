#nullable enable

using Altinn.AMUI.Core.Models.Common;

namespace Altinn.AMUI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for Altinn CDN service that provides methods to retrieve organization data.
    /// </summary>
    public interface IAltinnCdnService
    {
        /// <summary>
        /// Retrieves organization data from the Altinn CDN.
        /// </summary>
        /// <returns>A dictionary containing organization data, where the key is the organization code and the value is the <see cref="OrgData"/> object.</returns>
        Task<Dictionary<string, OrgData>> GetOrgData();
    }
}