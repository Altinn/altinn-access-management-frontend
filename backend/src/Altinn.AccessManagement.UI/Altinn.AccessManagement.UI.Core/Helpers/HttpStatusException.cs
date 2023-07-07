using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// An exception that contains the statusCode of an Http call gone wrong
    /// </summary>
    public class HttpStatusException : Exception
    {
        /// <summary>
        /// The Statuscode provided by the external call
        /// </summary>
        public HttpStatusCode StatusCode { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="statusCode">The status code</param>
        /// <param name="message">The message</param>
        public HttpStatusException(HttpStatusCode statusCode, string message) : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
