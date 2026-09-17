#nullable enable

using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
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

        /// <summary>
        /// Resolves the service owner logo for resources that are passed through to the frontend as
        /// they arrive from Access Management, whose provider logo url is the wide logo rather than
        /// the emblem the UI renders.
        /// </summary>
        /// <param name="resources">Resources to resolve logos for. Modified in place</param>
        Task ApplyOwnerLogos(IEnumerable<ResourceAM> resources);

        /// <summary>
        /// Resolves the service owner logo for the resources of every given access package.
        /// </summary>
        /// <param name="packages">Access packages whose resources to resolve logos for. Modified in place</param>
        Task ApplyOwnerLogos(IEnumerable<AccessPackageAM> packages);
    }
}
