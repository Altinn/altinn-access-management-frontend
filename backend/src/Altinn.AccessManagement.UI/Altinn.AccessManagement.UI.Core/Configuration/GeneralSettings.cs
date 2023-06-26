namespace Altinn.AccessManagement.UI.Core.Configuration
{
    /// <summary>
    /// General configuration settings
    /// </summary>
    public class GeneralSettings
    {
        /// <summary>
        /// Gets or sets the access management ui base url.
        /// </summary>
        public string FrontendBaseUrl { get; set; }

        /// <summary>
        /// Gets or sets the host name.
        /// </summary>
        public string Hostname { get; set; }

        /// <summary>
        /// Option to disable csrf check
        /// </summary>
        public bool DisableCsrfCheck { get; set; }

        /// <summary>
        /// Language cookie name
        /// </summary>
        public string LanguageCookie { get; set; }

        /// <summary>
        /// Wheather or not to use Mock data where available
        /// </summary>
        public bool UseMockData { get; set; }
    }
}
