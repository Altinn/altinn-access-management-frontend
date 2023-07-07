using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utils for pagination
    /// </summary>
    internal static class PaginationUtils
    {
        /// <summary>
        /// Paginates a list, returning the list elements pertaining to the given page
        /// </summary>
        /// <typeparam name="T">The type contained in the list</typeparam>
        /// <param name="list">The list to be paginated</param>
        /// <param name="page">The page number of the returned elements </param>
        /// <param name="numPerPage">Number of elements on each page</param>
        /// <returns>The elements present on the given page</returns>
        /// <exception cref="ArgumentOutOfRangeException">This exception is thown when either numPerage or page is not valid, souch as if asking for a page does not exist</exception>
        public static PaginatedList<T> GetListPage<T>(List<T> list, int page, int numPerPage)
        {
            if (numPerPage <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(numPerPage));
            }

            if (page <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(page));
            }

            if (page > (list.Count / numPerPage) + 1)
            {
                // Asked for a page that does not exist
                throw new ArgumentOutOfRangeException(nameof(page));
            }

            int pageStartIndex = (page - 1) * numPerPage;
            int endIndex = pageStartIndex + numPerPage;

            List<T> pageEntries = new List<T>();

            if (numPerPage >= list.Count)
            {
                // The full list fits on one page
                pageEntries = list;
            }
            else if (endIndex >= list.Count)
            {
                // Final page -> return whatever is left
                pageEntries = list.GetRange(pageStartIndex, list.Count - pageStartIndex);
            }
            else
            {
                pageEntries = list.GetRange(pageStartIndex, numPerPage);
            }

            return new PaginatedList<T>(pageEntries, page, list.Count);
        }
    }
}
