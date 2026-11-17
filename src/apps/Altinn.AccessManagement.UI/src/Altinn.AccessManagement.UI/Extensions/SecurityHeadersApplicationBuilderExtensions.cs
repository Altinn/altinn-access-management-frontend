using Altinn.AccessManagement.UI.Middleware;
using Microsoft.AspNetCore.Builder;

namespace Altinn.AccessManagement.UI.Extensions
{
    /// <summary>
    /// Extensions for adding default security headers middleware to the pipeline.
    /// </summary>
    public static class SecurityHeadersApplicationBuilderExtensions
    {
        /// <summary>
        /// Adds the security headers to the pipeline.
        /// </summary>
        /// <param name="builder">The application builder</param>
        /// <returns></returns>
        public static IApplicationBuilder UseDefaultSecurityHeaders(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}
