using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
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
    public class SingleRightClient : ISingleRightClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        public SingleRightClient(
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
        public async Task<ResourceCheckDto> GetDelegationCheck(Guid from, string resource)
        {
            string endpointUrl = $"enduser/connections/resources/delegationcheck?party={from}&resource={resource}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<ResourceCheckDto>(response);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys)
        {
            try
            {
                string endpointUrl = $"enduser/connections/resources?party={party}&to={to}&from={from}&resource={resourceId}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                string requestBody = JsonSerializer.Serialize(actionKeys, _serializerOptions);
                StringContent content = new StringContent(requestBody, System.Text.Encoding.UTF8, "application/json");
                var httpResponse = await _client.PostAsync(token, endpointUrl, content);
                return httpResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SingleRightClient // SingleRightDelegationCheck // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateSingleRightsAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys)
        {
            try
            {
                string endpointUrl = $"enduser/connections/resources?party={party}&to={to}&from={from}&resource={resourceId}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                string requestBody = JsonSerializer.Serialize(actionKeys, _serializerOptions);
                StringContent content = new StringContent(requestBody, System.Text.Encoding.UTF8, "application/json");
                var httpResponse = await _client.PutAsync(token, endpointUrl, content);
                return httpResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SingleRightClient // AccessPackageDelegationCheck // Exception");
                throw;
            }
        }
    }
}
