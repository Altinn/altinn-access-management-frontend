using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Models.ResourceRegistry
{
    /// <summary>
    /// One page of resources
    /// </summary>
    public class PaginatedList<T>
    {
        /// <summary>
        /// Current page
        /// </summary>
        public int Page { get; set; }

        /// <summary>
        /// Total number of list entires
        /// </summary>
        public int NumEntriesTotal { get; set; }

        /// <summary>
        /// The list entries pertaining to the current page
        /// </summary>
        public List<T> PageList { get; set; }

        /// <summary>
        /// Parameterless constructor
        /// </summary>
        public PaginatedList()
        {
        }

        /// <summary>
        /// Constructor for the model
        /// </summary>
        /// <param name="list">The list entries pertaining to the page</param>
        /// <param name="page">The page</param>
        /// <param name="numEntiresTotal">The total number of list items</param>
        public PaginatedList(List<T> list, int page, int numEntiresTotal)
        {
            PageList = list;
            Page = page;
            NumEntriesTotal = numEntiresTotal;
        }
    }
}
