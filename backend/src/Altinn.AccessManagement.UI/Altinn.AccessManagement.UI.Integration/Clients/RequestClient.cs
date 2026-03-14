using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Request;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with Single Rights API
    /// </summary>
    public class RequestClient : IRequestClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        public RequestClient(
            HttpClient httpClient,
            ILogger<RequestClient> logger,
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
        public async Task<PaginatedResult<RequestResourceDto>> GetSingleRightRequests(Guid party, Guid from, Guid to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                var queryParams = status?.Select(s => new KeyValuePair<string, string>("status", s.ToString())) ?? [];
                string endpointUrl = QueryHelpers.AddQueryString("/enduser/request", new Dictionary<string, string>
                {
                    { "party", party.ToString() },
                    { "to", to.ToString() },
                    { "from", from.ToString() }
                }.Concat(queryParams));
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.GetAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<RequestResourceDto>>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // GetSingleRightRequests // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<bool> CreateSingleRightRequest(Guid party, Guid from, Guid to, string resource, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"/enduser/request/resource?party={party}&from={from}&to={to}&resource={resource}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PostAsync(token, endpointUrl, null);
                if (httpResponse.IsSuccessStatusCode)
                {
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // CreateSingleRightRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawSingleRightRequest(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"/enduser/sent/withdraw?id={id}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PutAsync(token, endpointUrl, null);
                if (httpResponse.IsSuccessStatusCode)
                {
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // WithdrawSingleRightRequest // Exception");
                throw;
            }
        }
    }
}