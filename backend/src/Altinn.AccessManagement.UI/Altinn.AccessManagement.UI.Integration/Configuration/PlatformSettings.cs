namespace Altinn.AccessManagement.UI.Integration.Configuration
{
    /// <summary>
    /// General configuration settings
    /// </summary>
    public class PlatformSettings
    {
        /// <summary>
        /// Gets or sets the base url for the platform api.
        /// </summary>
        public string? PlatformApiBaseUrl { get; set; }

        /// <summary>
        /// Name of the cookie for where JWT is stored
        /// </summary>
        public string? JwtCookieName { get; set; }

        /// <summary>
        /// Open Id Connect Well known endpoint
        /// </summary>
        public string? OpenIdWellKnownEndpoint { get; set; }

        /// <summary>
        /// Altinn platform base url
        /// </summary>
        public string? AltinnPlatformBaseUrl { get; set; }

        /// <summary>
        /// Endpoint for authentication
        /// </summary>
        public string? ApiAuthenticationEndpoint { get; set; }

        /// <summary>
        /// Endpoint for profile
        /// </summary>
        public string? ApiProfileEndpoint { get; set; }

        /// <summary>
        /// Gets or sets the subscriptionkey.
        /// </summary>
        public string? SubscriptionKey { get; set; }

        /// <summary>
        /// Gets or sets the SubscriptionKeyHeaderName
        /// </summary>
        public string? SubscriptionKeyHeaderName { get; set; }
    }
}
