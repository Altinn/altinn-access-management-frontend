namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Utility methods for validating redirect urls after approving/rejecting consent requests.
    /// </summary>
    public static class RedirectUrlUtils
    {
        /// <summary>
        /// Checks whether a redirect url is an absolute https url whose host exactly matches one of the allowed hosts.
        /// Subdomains of an allowed host are not accepted.
        /// </summary>
        /// <param name="redirectUrl">The url to check.</param>
        /// <param name="allowedHosts">Exact host names that are allowed.</param>
        /// <returns><c>true</c> if the url is https and its host is in <paramref name="allowedHosts"/>, otherwise <c>false</c>.</returns>
        public static bool IsAllowedHost(string redirectUrl, IEnumerable<string> allowedHosts)
        {
            if (allowedHosts == null || !Uri.TryCreate(redirectUrl, UriKind.Absolute, out Uri uri) || uri.Scheme != Uri.UriSchemeHttps)
            {
                return false;
            }

            return allowedHosts.Contains(uri.Host, StringComparer.OrdinalIgnoreCase);
        }
    }
}
