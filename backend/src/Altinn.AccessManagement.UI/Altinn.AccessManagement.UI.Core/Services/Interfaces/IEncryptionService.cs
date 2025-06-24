using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for encryption service.Provides ecnryption and decryption functionality using a certificate stored in Azure Key Vault for BFF
    /// </summary>
    public interface IEncryptionService
    {
        /// <summary>
        /// Encrypts the given clear text using a certificate from Azure Key Vault.
        /// </summary>
        /// <param name="clearText">The clear text to encrypt.</param>
        /// <returns>A task that represents the asynchronous operation, containing the encrypted text as a base64 string.</returns>
        Task<string> EncryptText(string clearText);

        /// <summary>
        /// Decrypts the given base64 encrypted text using a certificate from Azure Key Vault.
        /// </summary>
        /// <param name="base64EncryptedText">The base64 encrypted text to decrypt.</param>
        /// <returns>A task that represents the asynchronous operation, containing the decrypted clear text.</returns>
        Task<string> DecryptText(string base64EncryptedText);
    }
}
