using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;
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
        public async Task<List<InstancePermission>> GetDelegatedInstances(string languageCode, Guid party, Guid? from, Guid? to, string resource, string instance)
        {
            List<string> queryParameters = [$"party={party}"];

            if (from.HasValue)
            {
                queryParameters.Add($"from={from.Value}");
            }

            if (to.HasValue)
            {
                queryParameters.Add($"to={to.Value}");
            }

            if (!string.IsNullOrWhiteSpace(resource))
            {
                queryParameters.Add($"resource={Uri.EscapeDataString(resource)}");
            }

            if (!string.IsNullOrWhiteSpace(instance))
            {
                queryParameters.Add($"instance={Uri.EscapeDataString(instance)}");
            }

            string endpointUrl = $"enduser/connections/resources/instances?{string.Join("&", queryParameters)}";

            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode: languageCode);

            PaginatedResult<InstancePermission> paginatedResult =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<InstancePermission>>(response, _logger, "InstanceClient // GetDelegatedInstances");

            return paginatedResult?.Items?.ToList() ?? [];
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
        public async Task<InstanceRights> GetInstanceRights(string languageCode, Guid party, Guid from, Guid to, string resource, string instance)
        {
            string endpointUrl =
                $"enduser/connections/resources/instances/rights?party={party}&from={from}&to={to}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";

            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode: languageCode);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<InstanceRights>(response, _logger, "InstanceClient // GetInstanceRights");
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateInstanceRightsAccess(Guid party, Guid? to, string resource, string instance, InstanceRightsDelegationDto input)
        {
            try
            {
                string endpointUrl = $"enduser/connections/resources/instances/rights?party={party}&to={to}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                string requestBody = JsonSerializer.Serialize(input);
                StringContent content = new StringContent(requestBody, Encoding.UTF8, "application/json");

                var response = await _client.PostAsync(token, endpointUrl, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Unexpected http response. Status code: {response.StatusCode}, Reason: {response.ReasonPhrase}");
                    throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", response.StatusCode, null, response.ReasonPhrase);
                }

                return response;
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

                var response = await _client.PutAsync(token, endpointUrl, content);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("InstanceClient // UpdateInstanceRightsAccess // Unexpected status {StatusCode}", (int)response.StatusCode);
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // InstanceClient // UpdateInstanceRightsAccess // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<SimplifiedParty>> GetInstanceUsers(Guid party, string resource, string instance)
        {
            string endpointUrl = $"enduser/connections/resources/instances/users?party={party}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            PaginatedResult<SimplifiedParty> paginatedResult =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<SimplifiedParty>>(response, _logger, "InstanceClient // GetInstanceUsers");

            return paginatedResult?.Items?.ToList() ?? [];
        }

        /// <inheritdoc />
        public async Task<List<SimplifiedConnection>> GetAvailableUsers(Guid party)
        {
            string endpointUrl = $"enduser/connections/users?party={party}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            PaginatedResult<SimplifiedConnection> paginatedResult =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<SimplifiedConnection>>(response, _logger, "InstanceClient // GetAvailableUsers");

            return paginatedResult?.Items?.ToList() ?? [];
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RemoveInstance(Guid party, Guid from, Guid to, string resource, string instance)
        {
            try
            {
                string endpointUrl =
                    $"enduser/connections/resources/instances?party={party}&from={from}&to={to}&resource={Uri.EscapeDataString(resource)}&instance={Uri.EscapeDataString(instance)}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                var response = await _client.DeleteAsync(token, endpointUrl);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("InstanceClient // RemoveInstance // Unexpected status {StatusCode}", (int)response.StatusCode);
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // InstanceClient // RemoveInstance // Exception");
                throw;
            }
        }
    }
}
