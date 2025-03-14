namespace Altinn.AccessManagement.UI.Integration.Configuration
{
    /// <summary>
    /// General configuration settings.
    /// </summary>
    public class PlatformSettings
    {
        /// <summary>
        /// Gets or sets the access management api endpoint
        /// </summary>
        public string ApiAccessManagementEndpoint { get; set; }

        /// <summary>
        /// Gets or sets the access packages api endpoint
        /// </summary>
        public string ApiAccessPackageEndpoint { get; set; }

        /// <summary>
        /// Gets or sets the authentication api endpoint
        /// </summary>
        public string ApiAuthenticationEndpoint { get; set; }

        /// <summary>
        /// Gets or sets the profile api endpoint.
        /// </summary>
        public string ApiProfileEndpoint { get; set; }

        /// <summary>
        /// Gets or sets the register api endpoint.
        /// </summary>
        public string ApiRegisterEndpoint { get; set; }

        /// <summary>
        /// Gets or sets the resource registry api endpoint.
        /// </summary>
        public string ApiResourceRegistryEndpoint { get; set; }

        /// <summary>
        /// Name of the cookie for where JWT is stored
        /// </summary>
        public string JwtCookieName { get; set; }

        /// <summary>
        /// Open Id Connect Well known endpoint
        /// </summary>
        public string OpenIdWellKnownEndpoint { get; set; }

        /// <summary>
        /// Gets or sets the subscriptionkey.
        /// </summary>
        public string SubscriptionKey { get; set; }

        /// <summary>
        /// Gets or sets the SubscriptionKeyHeaderName
        /// </summary>
        public string SubscriptionKeyHeaderName { get; set; }
    }
}
