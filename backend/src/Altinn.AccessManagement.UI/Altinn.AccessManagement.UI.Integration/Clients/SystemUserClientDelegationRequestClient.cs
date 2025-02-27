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
    /// Client for handling system user client delegation requests.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SystemUserClientDelegationRequestClient : ISystemUserClientDelegationRequestClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _jsonSerializerOptions = new() { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserClientDelegationRequestClient"/> class.
        /// </summary>
        /// <param name="logger">The logger instance.</param>
        /// <param name="httpClient">The HTTP client instance.</param>
        /// <param name="httpContextAccessor">The HTTP context accessor instance.</param>
        /// <param name="platformSettings">The platform settings.</param>
        public SystemUserClientDelegationRequestClient(
            ILogger<SystemUserClientDelegationRequestClient> logger, 
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
        public async Task<Result<SystemUserClientDelegationRequest>> GetSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {        
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/clientdelegationrequest/{partyId}/{clientDelegationRequestId}";
                HttpResponseMessage response = await _httpClient.GetAsync(token, endpoint);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    

                if (response.IsSuccessStatusCode) 
                {
                    return JsonSerializer.Deserialize<SystemUserClientDelegationRequest>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientDelegationRequestClient // GetSystemUserClientDelegationRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientDelegationRequestClient // GetSystemUserClientDelegationRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> ApproveSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/clientdelegationrequest/{partyId}/{clientDelegationRequestId}/approve";
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpoint, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    
                
                if (response.IsSuccessStatusCode) 
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientDelegationRequestClient // ApproveSystemUserClientDelegationRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientDelegationRequestClient // ApproveSystemUserClientDelegationRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> RejectSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/clientdelegationrequest/{partyId}/{clientDelegationRequestId}/reject";
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpoint, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    
                
                if (response.IsSuccessStatusCode) 
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientDelegationRequestClient // RejectSystemUserClientDelegationRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientDelegationRequestClient // RejectSystemUserClientDelegationRequest // Exception");
                throw;
            }
        }
    }
}