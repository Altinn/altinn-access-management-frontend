using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Constants;
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
    /// Client for handling system user agent delegation requests.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SystemUserAgentRequestClient : ISystemUserAgentRequestClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _jsonSerializerOptions = new() { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentRequestClient"/> class.
        /// </summary>
        /// <param name="logger">The logger instance.</param>
        /// <param name="httpClient">The HTTP client instance.</param>
        /// <param name="httpContextAccessor">The HTTP context accessor instance.</param>
        /// <param name="platformSettings">The platform settings.</param>
        public SystemUserAgentRequestClient(
            ILogger<SystemUserAgentRequestClient> logger, 
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
        public async Task<Result<SystemUserAgentRequest>> GetSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {        
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/request/agent/{partyId}/{agentRequestId}";
                HttpResponseMessage response = await _httpClient.GetAsync(token, endpoint);
                
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return Problem.RequestNotFound;
                } 
                
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    

                if (response.IsSuccessStatusCode) 
                {
                    return JsonSerializer.Deserialize<SystemUserAgentRequest>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserAgentRequestClient // GetSystemUserAgentRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserAgentRequestClient // GetSystemUserAgentRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> ApproveSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/request/agent/{partyId}/{agentRequestId}/approve";
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpoint, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    
                
                if (response.IsSuccessStatusCode) 
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserAgentRequestClient // ApproveSystemUserAgentRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserAgentRequestClient // ApproveSystemUserAgentRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> RejectSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/request/agent/{partyId}/{agentRequestId}/reject";
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpoint, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    
                
                if (response.IsSuccessStatusCode) 
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserAgentRequestClient // RejectSystemUserAgentRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserAgentRequestClient // RejectSystemUserAgentRequest // Exception");
                throw;
            }
        }
    }
}