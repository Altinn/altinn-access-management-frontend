using System.Security.Cryptography.X509Certificates;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Common.AccessTokenClient.Configuration;
using Altinn.Common.AccessTokenClient.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class AccessTokenProvider : IAccessTokenProvider
    {
        private readonly IKeyVaultService _keyVaultService;
        private readonly IAccessTokenGenerator _accessTokenGenerator;
        private readonly AccessTokenSettings _accessTokenSettings;
        private readonly ClientSettings _clientSettings;
        private static readonly SemaphoreSlim Semaphore = new SemaphoreSlim(1, 1);
        private static DateTime _cacheTokenUntil = DateTime.MinValue;
        private string _accessToken;
        private readonly ILogger<IAccessTokenProvider> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessTokenProvider"/> class.
        /// </summary>
        /// <param name="keyVaultService">The key vault service.</param>
        /// <param name="accessTokenGenerator">The access token generator.</param>
        /// <param name="keyVaultSettings">The key vault settings.</param>
        public AccessTokenProvider(
            IKeyVaultService keyVaultService,
            IAccessTokenGenerator accessTokenGenerator,
            IOptions<AccessTokenSettings> accessTokenSettings,
            IOptions<ClientSettings> clientSettings,
            ILogger<IAccessTokenProvider> logger)
        {
            _keyVaultService = keyVaultService;
            _accessTokenGenerator = accessTokenGenerator;
            _accessTokenSettings = accessTokenSettings.Value;
            _clientSettings = clientSettings.Value;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<string> GetAccessToken()
        {
            await Semaphore.WaitAsync();

            try
            {
                if (_accessToken == null || _cacheTokenUntil < DateTime.UtcNow)
                {
                    string certBase64 = await _keyVaultService.GetCertificateAsync(_clientSettings.KeyVaultUri, _clientSettings.CertificateName);
                    _accessToken = _accessTokenGenerator.GenerateAccessToken(
                        _clientSettings.Issuer,
                        _clientSettings.App,
                        new X509Certificate2(Convert.FromBase64String(certBase64), (string)null, X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable));

                    _cacheTokenUntil = DateTime.UtcNow.AddSeconds(_accessTokenSettings.TokenLifetimeInSeconds - 2); // Add some slack to avoid tokens expiring in transit
                }

                return _accessToken;
            }
            catch (Exception ex)
            {
                _logger.LogInformation("Failed to generate access token");
                return null;
            }
            finally
            {
                Semaphore.Release();
            }
        }
    }
}
