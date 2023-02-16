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
    }
}
