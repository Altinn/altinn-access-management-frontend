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
    /// Client for interacting with system user endpoints in the Altinn Access Management API.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SystemUserClient : ISystemUserClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserClient"/> class.
        /// </summary>
        /// <param name="logger">The logger instance.</param>
        /// <param name="httpClient">The HTTP client instance.</param>
        /// <param name="httpContextAccessor">The HTTP context accessor instance.</param>
        /// <param name="platformSettings">The platform settings.</param>
        public SystemUserClient(
            ILogger<SystemUserClient> logger, 
            HttpClient httpClient, 
            IHttpContextAccessor httpContextAccessor, 
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;        
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAuthenticationEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _httpClient = httpClient;
        }

        /// <inheritdoc/>
        public async Task<SystemUser> GetSpecificSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/{partyId}/{id}";

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<SystemUser>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // GetSpecificSystemUser // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // GetSpecificSystemUser // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<SystemUser>> CreateNewSystemUser(int partyId, NewSystemUserRequest newSystemUser, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/{partyId}/create";

                var content = JsonContent.Create(newSystemUser);
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpointUrl, content);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            
                if (response.IsSuccessStatusCode) 
                {
                    return JsonSerializer.Deserialize<SystemUser>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // CreateNewSystemUser // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // CreateNewSystemUser // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> DeleteSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/{partyId}/{id}";

                HttpResponseMessage response = await _httpClient.DeleteAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // DeleteSystemUser // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // DeleteSystemUser // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<List<SystemUser>> GetSystemUsersForParty(int partyId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/{partyId}";

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<List<SystemUser>>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // GetSystemUsersForParty // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return new List<SystemUser>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // GetSystemUsersForParty // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<SystemUser> GetAgentSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/{partyId}/{id}";

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<SystemUser>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // GetAgentSystemUser // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // GetAgentSystemUser // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<List<SystemUser>> GetAgentSystemUsersForParty(int partyId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/agent/{partyId}";

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<List<SystemUser>>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // GetAgentSystemUsersForParty // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return new List<SystemUser>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // GetAgentSystemUsersForParty // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> DeleteAgentSystemUser(int partyId, Guid systemUserId, Guid facilitatorId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/agent/{partyId}/{systemUserId}?facilitatorId={facilitatorId}";

                HttpResponseMessage response = await _httpClient.DeleteAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // DeleteAgentSystemUser // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // DeleteAgentSystemUser // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<List<Customer>>> GetClients(int partyId, Guid facilitatorId, List<string> accessPackages, CancellationToken cancellationToken)
        {
            try
            {
                string packageQuery = accessPackages.Aggregate(string.Empty, (acc, accessPackage) => acc + $"&packages={accessPackage}");
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemuser/agent/{partyId}/clients?facilitatorId={facilitatorId}{packageQuery}";

                HttpResponseMessage response = await _httpClient.DeleteAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<List<Customer>>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClient // GetClients // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClient // GetClients // Exception");
                throw;
            }
        }
    }
}