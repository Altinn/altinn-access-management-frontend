using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Models.AccessManagement
{
    /// <summary>
    /// Information about a granted access
    /// </summary>
    public class AccessRecipient
    {
        /// <summary>
        /// Information about the recipient of the access
        /// </summary>
        public Recipient Recipient { get; set; }

        /// <summary>
        /// Details pertaining the access itself
        /// </summary>
        public List<AccessDetails> Details { get; set; }
    }
}
