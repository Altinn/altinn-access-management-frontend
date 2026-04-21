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
    /// Client for interacting with the Request API
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
        public async Task<PaginatedResult<Request>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            try
            {
                var queryParams = new Dictionary<string, string>
                {
                    { "party", party.ToString() }
                };

                if (to.HasValue)
                {
                    queryParams.Add("to", to.Value.ToString());
                }

                var statusParams = status?.Select(s => new KeyValuePair<string, string>("status", s.ToString())) ?? [];

                if (!string.IsNullOrEmpty(type))
                {
                    queryParams.Add("type", type);
                }

                string endpointUrl = QueryHelpers.AddQueryString("enduser/request/sent", queryParams.Concat(statusParams));
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var httpResponse = await _client.GetAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<Request>>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // GetSentRequests // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<Request>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            try
            {
                var queryParams = new Dictionary<string, string>
                {
                    { "party", party.ToString() }
                };

                if (from.HasValue)
                {
                    queryParams.Add("from", from.Value.ToString());
                }

                var statusParams = status?.Select(s => new KeyValuePair<string, string>("status", s.ToString())) ?? [];

                if (!string.IsNullOrEmpty(type))
                {
                    queryParams.Add("type", type);
                }

                string endpointUrl = QueryHelpers.AddQueryString("enduser/request/received", queryParams.Concat(statusParams));
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.GetAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<Request>>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // GetReceivedRequests // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> GetRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = QueryHelpers.AddQueryString($"enduser/request/{id}", "party", party.ToString());
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.GetAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // GetRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> GetDraftRequest(Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"enduser/request/draft?id={id}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.GetAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // GetDraftRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"enduser/request/resource?party={party}&to={to}&resource={resource}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PostAsync(token, endpointUrl, null);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // CreateResourceRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> CreatePackageRequest(Guid party, Guid to, string package, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"enduser/request/package?party={party}&to={to}&package={package}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PostAsync(token, endpointUrl, null);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // CreatePackageRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"enduser/request/sent/withdraw?party={party}&id={id}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PutAsync(token, endpointUrl, null);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // WithdrawRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> ConfirmRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"enduser/request/draft/confirm?party={party}&id={id}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PutAsync(token, endpointUrl, null);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // ConfirmRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> RejectRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"enduser/request/received/reject?party={party}&id={id}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PutAsync(token, endpointUrl, null);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // RejectRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<Request> ApproveRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"enduser/request/received/approve?party={party}&id={id}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.PutAsync(token, endpointUrl, null);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<Request>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // ApproveRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<int> GetSentRequestsCount(Guid party, Guid? to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                var queryParams = new Dictionary<string, string>
                {
                    { "party", party.ToString() }
                };

                if (to.HasValue)
                {
                    queryParams.Add("to", to.Value.ToString());
                }

                var statusParams = status?.Select(s => new KeyValuePair<string, string>("status", s.ToString())) ?? [];

                string endpointUrl = QueryHelpers.AddQueryString("enduser/request/sent/count", queryParams.Concat(statusParams));
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.GetAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<int>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // GetSentRequestsCount // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<int> GetReceivedRequestsCount(Guid party, Guid? from, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            try
            {
                var queryParams = new Dictionary<string, string>
                {
                    { "party", party.ToString() }
                };

                if (from.HasValue)
                {
                    queryParams.Add("from", from.Value.ToString());
                }

                var statusParams = status?.Select(s => new KeyValuePair<string, string>("status", s.ToString())) ?? [];

                string endpointUrl = QueryHelpers.AddQueryString("enduser/request/received/count", queryParams.Concat(statusParams));
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var httpResponse = await _client.GetAsync(token, endpointUrl);
                return await ClientUtils.DeserializeIfSuccessfullStatusCode<int>(httpResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RequestClient // GetReceivedRequestsCount // Exception");
                throw;
            }
        }
    }
}
