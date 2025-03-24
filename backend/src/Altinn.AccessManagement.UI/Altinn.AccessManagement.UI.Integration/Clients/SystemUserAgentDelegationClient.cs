using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// client that integrates with the agent deletation api
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SystemUserAgentDelegationClient : ISystemUserAgentDelegationClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentDelegationClient"/> class
        /// </summary>
        /// <param name="httpClient">http client</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        public SystemUserAgentDelegationClient(
            HttpClient httpClient,
            ILogger<SystemUserAgentDelegationClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;        
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAuthenticationEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
        }

        /// <inheritdoc/>
        public async Task<List<AgentDelegation>> GetSystemUserAgentDelegations(int partyId, Guid facilitatorId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/agent/{partyId}/{facilitatorId}/{systemUserGuid}/delegation";

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<List<AgentDelegation>>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserAgentDelegationClient // GetSystemUserAgentDelegations // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return [];
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserAgentDelegationClient // GetSystemUserAgentDelegations // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<AgentDelegation>> AddClient(int partyId, Guid systemUserGuid, AgentDelegationRequest delegationRequest, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/agent/{partyId}/{systemUserGuid}/delegation";
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegationRequest, _serializerOptions), System.Text.Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<AgentDelegation>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserAgentDelegationClient // AddClient // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserAgentDelegationClient // AddClient // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> RemoveClient(Guid facilitatorId, Guid delegationId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/agent/{facilitatorId}/{delegationId}";

                HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<bool>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserAgentDelegationClient // RemoveClient // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserAgentDelegationClient // RemoveClient // Exception");
                throw;
            }
        }
    }
}