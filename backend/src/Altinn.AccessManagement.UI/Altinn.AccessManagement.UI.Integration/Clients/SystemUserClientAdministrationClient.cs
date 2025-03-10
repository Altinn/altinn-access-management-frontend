using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// client that integrates with the platform register api
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SystemUserClientAdministrationClient : ISystemUserClientAdministrationClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterClientV2"/> class
        /// </summary>
        /// <param name="httpClient">http client</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public SystemUserClientAdministrationClient(
            HttpClient httpClient,
            ILogger<RegisterClientV2> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider)
        {
            _logger = logger;        
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAuthenticationEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
        }

        /// <inheritdoc/>
        public async Task<List<ClientDelegation>> GetSystemUserClientDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            // TODO: vi vet ikke hva denne returnerer enda
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/client/{partyId}/{systemUserGuid}/delegation";

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<List<ClientDelegation>>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientAdministrationClient // GetSystemUserClientDelegations // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientAdministrationClient // GetSystemUserClientDelegations // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> AddClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/client/{partyId}/{systemUserGuid}/delegation";

                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<bool>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientAdministrationClient // AddClient // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientAdministrationClient // AddClient // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/client/{partyId}/{systemUserGuid}/delegation";

                HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<bool>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientAdministrationClient // RemoveClient // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientAdministrationClient // RemoveClient // Exception");
                throw;
            }
        }
    }
}