using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Configuration
{
    /// <summary>
    /// Configuration object used to hold settings for the KeyVault.
    /// </summary>
    public class KeyVaultSettings
    {
        /// <summary>
        /// Uri to keyvault
        /// </summary>
        public string KeyVaultUri { get; set; }

        /// <summary>
        /// Name of the certificate secret
        /// </summary>
        public string CertificateName { get; set; }
    }
}
