using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.IdPortenAuthorization;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with the IdPortenAuthorization API
    /// </summary>
    public class IdPortenAuthorizationClient : IIdPortenAuthorizationClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="IdPortenAuthorizationClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        public IdPortenAuthorizationClient(
            HttpClient httpClient,
            ILogger<IdPortenAuthorizationClient> logger,
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
        public async Task<IEnumerable<IdPortenAuthorization>> GetIdPortenAuthorizations(CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = "bff/idportenauthorization";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.GetAsync(token, endpointUrl, cancellationToken);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<IdPortenAuthorization>>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // IdPortenAuthorizationClient // GetIdPortenAuthorizations // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawIdPortenAuthorization(string id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"bff/idportenauthorization?id={id}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.DeleteAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<bool>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // IdPortenAuthorizationClient // WithdrawIdPortenAuthorization // Exception");
                throw;
            }
        }
    }
}