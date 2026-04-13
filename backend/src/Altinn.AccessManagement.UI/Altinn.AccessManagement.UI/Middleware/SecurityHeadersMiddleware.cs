using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Altinn.AccessManagement.UI.Middleware
{
    /// <summary>
    /// Middleware for sending security headers in response.
    ///
    /// The following headers will be set:
    /// X-Frame-Options
    /// X-Content-Type-Options
    /// X-XSS-Protection
    /// Referrer-Policy
    /// </summary>
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHostEnvironment _environment;

        /// <summary>
        /// Default constructor for ASPNET Core Middleware.
        /// </summary>
        /// <param name="next">The next middleware</param>
        /// <param name="environment">The current host environment</param>
        public SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment environment)
        {
            _next = next;
            _environment = environment;
        }

        /// <summary>
        /// Executes the middleware. Expects the next middleware to be executed.
        /// </summary>
        /// <param name="context">The current HttpContext</param>
        /// <returns></returns>
        public Task Invoke(HttpContext context)
        {
            context.Response.Headers.Append("X-Frame-Options", "deny");
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("X-XSS-Protection", "0");
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
            context.Response.Headers.Append("Content-Security-Policy-Report-Only", CreateContentSecurityPolicy());

            return _next(context);
        }

        private string CreateContentSecurityPolicy()
        {
            string scriptSrc = _environment.IsDevelopment()
                ? "script-src 'self' 'unsafe-inline' http://localhost:5173;"
                : "script-src 'self' 'unsafe-inline';";

            string connectSrc = _environment.IsDevelopment()
                ? "connect-src 'self' http://localhost:5173 ws://localhost:5173;"
                : "connect-src 'self';";

            return string.Join(" ",
                "default-src 'self';",
                scriptSrc,
                "style-src 'self' 'unsafe-inline' https://altinncdn.no;",
                "font-src 'self' https://altinncdn.no data:;",
                "img-src 'self' data: https://altinncdn.no;",
                connectSrc,
                "frame-ancestors 'none';",
                "base-uri 'self';",
                "object-src 'none';");
        }
    }
}
