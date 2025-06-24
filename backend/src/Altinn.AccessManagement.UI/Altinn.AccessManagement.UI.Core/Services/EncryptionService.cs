using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc/>
    public class EncryptionService(IKeyVaultService keyVaultService, IOptions<ClientSettings> clientSettings, IOptions<KeyVaultSettings> keyVaultSettings) : IEncryptionService
    {
        private readonly IKeyVaultService _keyVaultService = keyVaultService;
        private readonly ClientSettings _clientSettings = clientSettings.Value;
        private readonly KeyVaultSettings _keyVaultSettings = keyVaultSettings.Value;

        /// <inheritdoc/>
        public async Task<string> EncryptText(string clearText)
        {
            string certBase64 = await _keyVaultService.GetCertificateAsync(_keyVaultSettings.SecretUri, _clientSettings.CertificateName);
            using (X509Certificate2 x509Certificate2 = X509CertificateLoader.LoadPkcs12(Convert.FromBase64String(certBase64), (string)null, X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable))
            {
                return Encrypt(clearText, x509Certificate2);
            }
        }

        /// <inheritdoc/>
        public async Task<string> DecryptText(string base64EncryptedText)
        {
            string certBase64 = await _keyVaultService.GetCertificateAsync(_keyVaultSettings.SecretUri, _clientSettings.CertificateName);
            X509Certificate2 x509Certificate2 = X509CertificateLoader.LoadPkcs12(Convert.FromBase64String(certBase64), (string)null, X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);
            return Decrypt(base64EncryptedText, x509Certificate2);
        }

        private static string Encrypt(string plaintext, X509Certificate2 cert)
        {
            using var rsa = cert.GetRSAPublicKey();

            // Generate AES key and IV
            using var aes = Aes.Create();
            aes.GenerateKey();
            aes.GenerateIV();

            // Encrypt the plaintext using AES
            using var encryptor = aes.CreateEncryptor();
            byte[] plainBytes = Encoding.UTF8.GetBytes(plaintext);
            byte[] cipherText = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

            // Encrypt AES key using RSA (OAEP for best security)
            byte[] encryptedKey = rsa.Encrypt(aes.Key, RSAEncryptionPadding.OaepSHA256);

            // Combine: [encryptedKeyLength][encryptedKey][IV][cipherText]
            using var ms = new MemoryStream();
            using (var bw = new BinaryWriter(ms, Encoding.UTF8, true))
            {
                bw.Write(encryptedKey.Length);
                bw.Write(encryptedKey);
                bw.Write(aes.IV.Length);
                bw.Write(aes.IV);
                bw.Write(cipherText);
            }

            return Convert.ToBase64String(ms.ToArray());
        }

        // Decrypt the string using the private key from the certificate
        private static string Decrypt(string encryptedBase64, X509Certificate2 cert)
        {
            using var rsa = cert.GetRSAPrivateKey();
            byte[] encryptedData = Convert.FromBase64String(encryptedBase64);

            using var ms = new MemoryStream(encryptedData);
            using var br = new BinaryReader(ms, Encoding.UTF8, true);

            // Read encrypted key
            int keyLen = br.ReadInt32();
            byte[] encryptedKey = br.ReadBytes(keyLen);

            // Decrypt AES key
            byte[] aesKey = rsa.Decrypt(encryptedKey, RSAEncryptionPadding.OaepSHA256);

            // Read IV
            int ivlen = br.ReadInt32();
            byte[] iv = br.ReadBytes(ivlen);

            // Remaining is cipherText
            byte[] cipherText = br.ReadBytes((int)(ms.Length - ms.Position));

            // Decrypt AES
            using var aes = Aes.Create();
            aes.Key = aesKey;
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor();
            byte[] plainBytes = decryptor.TransformFinalBlock(cipherText, 0, cipherText.Length);

            return Encoding.UTF8.GetString(plainBytes);
        }
    }
}
