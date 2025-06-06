﻿using System.Net;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    ///     An exception that contains the statusCode of an Http call gone wrong
    /// </summary>
    public class HttpStatusException : Exception
    {
        /// <summary>
        ///     Constructor for HttpStatusException
        /// </summary>
        /// <param name="type">The type of error</param>
        /// <param name="title">The title of the error</param>
        /// <param name="statusCode">The status code of the error</param>
        /// <param name="traceId">The id of the error that can be traced</param>
        /// <param name="message">A message or reason phraze to describe the error</param>
        public HttpStatusException(string type, string title, HttpStatusCode statusCode, string traceId, string message = "") : base(message)
        {
            Type = type;
            Title = title;
            StatusCode = statusCode;
            TraceId = traceId;
        }

        /// <summary>
        ///     The type of error
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        ///     The title of the error
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        ///     The status code of the error
        /// </summary>
        public HttpStatusCode StatusCode { get; set; }

        /// <summary>
        ///     The id of the error that can be traced
        /// </summary>
        public string TraceId { get; set; }
    }
}
