using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend
{
    /// <summary>
    /// Model representation of the query marameters used in search
    /// </summary>
    public class PaginatedSearchParams
    {
        /// <summary>
        /// The search string which content must be present
        /// </summary>
        public string? SearchString { get; set; }

        /// <summary>
        /// List of Service Owners to be used for filtering
        /// </summary>
        public string[]? ServiceOwners { get; set; }

        /// <summary>
        /// Number of returned resources (per page)
        /// </summary>
        public int NumPerPage { get; set; }

        /// <summary>
        /// Page to be returned
        /// </summary>
        public int CurrentPage { get; set; }
    }
}
