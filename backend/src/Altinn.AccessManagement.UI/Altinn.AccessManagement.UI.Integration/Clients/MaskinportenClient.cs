using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with Maskinporten administration endpoints.
    /// </summary>
    public class MaskinportenClient : IMaskinportenClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenClient"/> class.
        /// </summary>
        /// <param name="httpClient">The http client.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="httpContextAccessor">The http context accessor.</param>
        /// <param name="platformSettings">Platform settings configuration.</param>
        public MaskinportenClient(
            HttpClient httpClient,
            ILogger<MaskinportenClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, CancellationToken cancellationToken = default)
        {
            return await GetConnections($"enduser/maskinportensuppliers?party={party}", "MaskinportenClient.GetSuppliers", cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default)
        {
            return await GetConnections($"enduser/maskinportenconsumers?party={party}", "MaskinportenClient.GetConsumers", cancellationToken);
        }

        private async Task<IEnumerable<MaskinportenConnection>> GetConnections(string endpointUrl, string clientMethodName, CancellationToken cancellationToken)
        {
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            IEnumerable<MaskinportenConnection> connections =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<MaskinportenConnection>>(response, _logger, clientMethodName);

            return connections ?? Enumerable.Empty<MaskinportenConnection>();
        }
    }
}
