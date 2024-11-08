using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    public interface IAccessPackageService
    {
        /// <summary>
        ///     Performs a search for access packages based on the provided parameters and sorts them into a list of areas for frontend to display
        /// </summary>
        /// <param name="languageCode">languageCode.</param>
        /// <param name="searchString">searchString.</param>
        /// <returns>the resources that match the filters and search string corresponding to the provided page.</returns>
        Task<List<AccessAreaFE>> GetSearch(string languageCode, string searchString);
    }
}
