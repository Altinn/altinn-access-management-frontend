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
        /// Gets or sets the entrypoint javascript file name
        /// </summary>
        public string EntrypointJsFile { get; set; }

        /// <summary>
        /// Gets or sets the entrypoint css file name.
        /// </summary>
        public string EntrypointCssFile { get; set; }
    }
}
