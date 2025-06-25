using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{ 
    public class EncryptionServiceMock : IEncryptionService
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="EncryptionService" /> class
        /// </summary>
        public EncryptionServiceMock()
        {
        }

        public Task<string> DecryptText(string base64EncryptedText)
        {
            byte[] base64EncodedBytes = Convert.FromBase64String(base64EncryptedText);
            return Task.FromResult(System.Text.Encoding.UTF8.GetString(base64EncodedBytes));
        }

        public Task<string> EncryptText(string clearText)
        {
            byte[] plainTextBytes = System.Text.Encoding.UTF8.GetBytes(clearText);
            return Task.FromResult(Convert.ToBase64String(plainTextBytes));
        }
    }
}