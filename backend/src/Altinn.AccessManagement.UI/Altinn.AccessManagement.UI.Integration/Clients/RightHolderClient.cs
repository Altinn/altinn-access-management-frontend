using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with Access packages
    /// </summary>
    public class RightHolderClient : IRightHolderClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessPackageClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public RightHolderClient(
            HttpClient httpClient,
            ILogger<RightHolderClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _accessTokenProvider = accessTokenProvider;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> PostNewRightHolder(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/connections?party={party}&from={party}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            var httpResponse = await _client.PostAsync(token, endpointUrl, null);

            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError($"Unexpected http response. Status code: {httpResponse.StatusCode}, Reason: {httpResponse.ReasonPhrase}");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", httpResponse.StatusCode, null, httpResponse.ReasonPhrase);
            }

            return httpResponse;
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> RevokeRightHolder(Guid party, Guid to)
        {
            string endpointUrl = $"enduser/connections?party={party}&from={party}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            var httpResponse = await _client.DeleteAsync(token, endpointUrl);

            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError($"Unexpected http response. Status code: {httpResponse.StatusCode}, Reason: {httpResponse.ReasonPhrase}");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", httpResponse.StatusCode, null, httpResponse.ReasonPhrase);
            }

            return httpResponse;
        }

        /// <inheritdoc />
        public async Task<List<Connection>> GetRightHolders(Guid party, Guid? from, Guid? to)
        {
            var endpointBuilder = new System.Text.StringBuilder($"enduser/connections?party={party}&from={from?.ToString() ?? string.Empty}&to={to?.ToString() ?? string.Empty}");

            string endpointUrl = endpointBuilder.ToString();
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            try
            {
                var httpResponse = await _client.GetAsync(token, endpointUrl);
                if (!httpResponse.IsSuccessStatusCode)
                {
                    throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", httpResponse.StatusCode, null, httpResponse.ReasonPhrase);
                }
                
                string content = await httpResponse.Content.ReadAsStringAsync();
                PaginatedResult<Connection> rightHolders = JsonSerializer.Deserialize<PaginatedResult<Connection>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                var holders = rightHolders.Items.ToList();

                return rightHolders.Items.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting right holders");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", HttpStatusCode.InternalServerError, null, ex.Message);
            }
        }
    }
}
