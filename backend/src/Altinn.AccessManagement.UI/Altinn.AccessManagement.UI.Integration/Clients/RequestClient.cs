using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Request;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
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
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        public RequestClient(
            HttpClient httpClient,
            ILogger<AccessPackageClient> logger,
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
        public async Task<PaginatedResult<RequestResourceDto>> GetSingleRightRequests(Guid party, Guid to, Guid from, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"/enduser/request?party={party}&to={to}&from={from}&status={status}";
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
        public async Task<bool> CreateSingleRightRequest(Guid party, CreateRequestInput payload, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"/enduser/request?party={party}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                string requestBody = JsonSerializer.Serialize(payload, _serializerOptions);
                StringContent content = new StringContent(requestBody, System.Text.Encoding.UTF8, "application/json");
                var httpResponse = await _client.PostAsync(token, endpointUrl, content);
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
                string endpointUrl = $"/enduser/sent/withdraw";
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