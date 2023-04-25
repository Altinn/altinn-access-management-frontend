namespace Altinn.AccessManagement.UI.Core.Configuration
{
    /// <summary>
    /// The key vault settings used to fetch certificate information from key vault
    /// </summary>
    public class ClientSettings
    {
        /// <summary>
        /// The issuer
        /// </summary>
        public string Issuer { get; set; }

        /// <summary>
        /// The issuer
        /// </summary>
        public string App { get; set; }

        /// <summary>
        /// Name of the certificate secret
        /// </summary>
        public string CertificateName { get; set; }
    }
}
