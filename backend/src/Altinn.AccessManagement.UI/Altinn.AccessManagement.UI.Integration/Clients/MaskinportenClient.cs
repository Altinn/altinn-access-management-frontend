using System.Net;
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
            var token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var endpointUrl = $"enduser/maskinportensuppliers?party={party}";
            try
            {
                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<MaskinportenConnection>>(response, _logger, "MaskinportenClient.GetSuppliers");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting right holders");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default)
        {
            var token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var endpointUrl = $"enduser/maskinportenconsumers?party={party}";
            try
            {
                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<MaskinportenConnection>>(response, _logger, "MaskinportenClient.GetConsumers");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting right holders");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }
    }
}
