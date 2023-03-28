namespace Altinn.AccessManagement.UI.Integration.Configuration
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
        /// Uri to keyvault
        /// </summary>
        public string KeyVaultUri { get; set; }

        /// <summary>
        /// Name of the certificate secret
        /// </summary>
        public string SecretId { get; set; }
    }
}
