using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IAccessPackageClient
    {
        /// <summary>
        /// Retrieve result of a search in all access packages. If no parameters are given, all access packages are returned
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned and searched in</param>
        /// <param name="searchString">the text to be searched for</param>
        /// <returns>List of access packages matching the search parameters</returns>
        Task<IEnumerable<SearchObject<AccessPackage>>> GetAccessPackageSearchMatches(string languageCode, string searchString);

        /// <summary>
        ///     Gets all access package delegations from someone to someone (or multiple someones)
        /// </summary>
        /// <param name="party">The uuid of the party who is asking for the delegations</param>
        /// <param name="to">The uuid of the party who has received the delegated access packages (or empty, if delegations to all parties are to bbe returned)</param>
        /// <param name="from">The uuid of the party whose accesses have been delegated (or empty, if delegations from all parties are to be returned)</param>
        /// <param name="languageCode">The code of the language on which texts are to be returned</param>
        /// <returns>A list of all access package delegations</returns>
        Task<List<AccessPackageAccess>> GetAccessPackageAccesses(Guid party, Guid to, Guid from, string languageCode);
    }
}
