using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IAccessPackageClient
    {
        /// <summary>
        /// Retreive result of a search in all access packages. If no parameters are given, all access packages are returned
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned and searched in</param>
        /// <param name="searchString">the text to be searched for</param>
        /// <returns>List of access packages matching the search parameters</returns>
        Task<List<AccessPackage>> GetAccessPackageSearchMatches(string languageCode, string searchString);
    }
}
