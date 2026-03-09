using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with instance delegation API.
    /// </summary>
    public class InstanceClient : IInstanceClient
    {
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceClient"/> class.
        /// </summary>
        /// <param name="httpClient">The HTTP client.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="httpContextAccessor">The http context accessor.</param>
        /// <param name="platformSettings">The platform settings.</param>
        public InstanceClient(
            HttpClient httpClient,
            ILogger<InstanceClient> logger,
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
        public async Task<List<InstancePermission>> GetInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            StringBuilder endpointBuilder = new StringBuilder($"enduser/connections/resources/instances?party={party}");

            if (from.HasValue)
            {
                endpointBuilder.Append($"&from={from}");
            }

            if (to.HasValue)
            {
                endpointBuilder.Append($"&to={to}");
            }

            if (!string.IsNullOrWhiteSpace(resource))
            {
                endpointBuilder.Append($"&resource={Uri.EscapeDataString(resource)}");
            }

            if (!string.IsNullOrWhiteSpace(instance))
            {
                endpointBuilder.Append($"&instance={Uri.EscapeDataString(instance)}");
            }

            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.GetAsync(token, endpointBuilder.ToString(), languageCode: languageCode);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<List<InstancePermission>>(response, _logger, "InstanceClient // GetInstances");
        }

        /// <inheritdoc />
        public async Task<ResourceCheckDto> GetDelegationCheck(Guid party, string resource, string instance)
        {
            string endpointUrl =
                $"enduser/connections/resources/instances/delegationcheck?party={party}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<ResourceCheckDto>(response);
        }

        /// <inheritdoc />
        public async Task<InstanceRight> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance)
        {
            string endpointUrl =
                $"enduser/connections/resources/instances/rights?party={party}&from={from}&to={to}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";

            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode: languageCode);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<InstanceRight>(response, _logger, "InstanceClient // GetInstanceRights");
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateInstanceRightsAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            try
            {
                string endpointUrl =
                    $"enduser/connections/resources/instances/rights?party={party}&to={to}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var rightKeys = new { directRightKeys = actionKeys };
                string requestBody = JsonSerializer.Serialize(rightKeys);
                StringContent content = new StringContent(requestBody, Encoding.UTF8, "application/json");

                return await _client.PostAsync(token, endpointUrl, content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // InstanceClient // CreateInstanceRightsAccess // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> UpdateInstanceRightsAccess(Guid party, Guid to, string resource, string instance, List<string> actionKeys)
        {
            try
            {
                string endpointUrl =
                    $"enduser/connections/resources/instances/rights?party={party}&to={to}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var rightKeys = new { directRightKeys = actionKeys };
                string requestBody = JsonSerializer.Serialize(rightKeys);
                StringContent content = new StringContent(requestBody, Encoding.UTF8, "application/json");

                return await _client.PutAsync(token, endpointUrl, content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // InstanceClient // UpdateInstanceRightsAccess // Exception");
                throw;
            }
        }
    }
}
