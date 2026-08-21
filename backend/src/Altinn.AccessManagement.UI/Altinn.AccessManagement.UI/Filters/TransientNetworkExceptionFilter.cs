using System.Net.Sockets;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Filters
{
    /// <summary>
    /// Maps transient network failures towards downstream APIs to a 503 the caller may retry, instead of
    /// letting them surface as an unhandled exception (500).
    ///
    /// A socket error can be thrown by any of the integration clients, not just the ones that translate it
    /// into a problem themselves, and a single endpoint often calls several clients. Handling it in a global
    /// filter means every action and every client is covered, including clients added later.
    ///
    /// Any exception that is not a transient network error is left alone, so all other errors keep their
    /// existing behaviour.
    /// </summary>
    public class TransientNetworkExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<TransientNetworkExceptionFilter> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="TransientNetworkExceptionFilter"/> class.
        /// </summary>
        /// <param name="logger">the handler for logger service</param>
        public TransientNetworkExceptionFilter(ILogger<TransientNetworkExceptionFilter> logger)
        {
            _logger = logger;
        }

        /// <inheritdoc/>
        public void OnException(ExceptionContext context)
        {
            if (!IsTransientNetworkError(context.Exception))
            {
                return;
            }

            _logger.LogError(context.Exception, "AccessManagement.UI // TransientNetworkExceptionFilter // Transient network error towards downstream API // {Method} {Path}", context.HttpContext.Request.Method, context.HttpContext.Request.Path);

            ProblemDescriptor descriptor = Problem.DownstreamApiUnavailable;

            ProblemDetails problemDetails = new()
            {
                Status = (int)descriptor.StatusCode,
                Title = descriptor.Detail,
                Detail = descriptor.Detail,
            };
            problemDetails.Extensions["code"] = descriptor.ErrorCode.ToString();

            context.Result = new ObjectResult(problemDetails)
            {
                StatusCode = (int)descriptor.StatusCode,
                ContentTypes = { "application/problem+json" },
            };
            context.ExceptionHandled = true;
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
