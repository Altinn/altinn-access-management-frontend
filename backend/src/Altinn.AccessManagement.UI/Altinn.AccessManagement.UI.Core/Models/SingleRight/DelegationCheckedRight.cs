using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Models.SingleRight
{
    /// <summary>
    /// A right that that has been checked if it can be delegated or not on behalf of a given party
    /// </summary>
    public class DelegationCheckedRight
    {
        /// <summary>
        ///     The key for the right.
        /// </summary>
        public string RightKey { get; set; }

        /// <summary>
        ///     The action performed.
        /// </summary>
        public string Action { get; set; }

        /// <summary>
        ///     Whether or not the right has been deemed delegable
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        ///     The reason for the response.
        /// </summary>
        public List<Details> Details { get; set; }
    }
}
