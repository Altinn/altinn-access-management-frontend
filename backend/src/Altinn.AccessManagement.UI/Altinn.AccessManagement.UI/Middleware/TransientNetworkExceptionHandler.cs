using System.Net.Sockets;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Middleware
{
    /// <summary>
    /// Maps transient network failures towards downstream APIs to a 503 the caller may retry, instead of
    /// letting them surface as an unhandled exception (500).
    ///
    /// A socket error can be thrown by any of the integration clients, not just the ones that translate it
    /// into a problem themselves, and a single endpoint often calls several clients. Handling it here means
    /// every endpoint and every client is covered, including clients added later.
    ///
    /// Any exception that is not a transient network error is left alone, so all other errors keep their
    /// existing behaviour.
    /// </summary>
    public class TransientNetworkExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<TransientNetworkExceptionHandler> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="TransientNetworkExceptionHandler"/> class.
        /// </summary>
        /// <param name="logger">the handler for logger service</param>
        public TransientNetworkExceptionHandler(ILogger<TransientNetworkExceptionHandler> logger)
        {
            _logger = logger;
        }

        /// <inheritdoc/>
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            if (!IsTransientNetworkError(exception))
            {
                return false;
            }

            _logger.LogError(exception, "AccessManagement.UI // TransientNetworkExceptionHandler // Transient network error towards downstream API // {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);

            ProblemDescriptor descriptor = Problem.DownstreamApiUnavailable;

            httpContext.Response.StatusCode = (int)descriptor.StatusCode;
            ProblemDetails problemDetails = new()
            {
                Status = (int)descriptor.StatusCode,
                Title = descriptor.Detail,
                Detail = descriptor.Detail,
            };
            problemDetails.Extensions["code"] = descriptor.ErrorCode.ToString();

            await httpContext.Response.WriteAsJsonAsync(problemDetails, options: null, contentType: "application/problem+json", cancellationToken);

            return true;
        }

        /// <summary>
        /// A socket error surfaces wrapped in an HttpRequestException, and an HttpClient timeout surfaces as a
        /// TaskCanceledException wrapping a TimeoutException, so the whole exception chain has to be inspected.
        /// A cancellation without a TimeoutException is the caller going away, and is deliberately not included.
        /// </summary>
        private static bool IsTransientNetworkError(Exception exception)
        {
            for (Exception current = exception; current is not null; current = current.InnerException)
            {
                if (current is SocketException or TimeoutException)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
