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
    public class SystemUserClientRequestClient : ISystemUserClientRequestClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _jsonSerializerOptions = new() { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserClientRequestClient"/> class.
        /// </summary>
        /// <param name="logger">The logger instance.</param>
        /// <param name="httpClient">The HTTP client instance.</param>
        /// <param name="httpContextAccessor">The HTTP context accessor instance.</param>
        /// <param name="platformSettings">The platform settings.</param>
        public SystemUserClientRequestClient(
            ILogger<SystemUserClientRequestClient> logger, 
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
        public async Task<Result<SystemUserClientRequest>> GetSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken)
        {        
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/clientRequest/{partyId}/{clientRequestId}";
                HttpResponseMessage response = await _httpClient.GetAsync(token, endpoint);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    

                if (response.IsSuccessStatusCode) 
                {
                    return JsonSerializer.Deserialize<SystemUserClientRequest>(responseContent, _jsonSerializerOptions);
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientRequestClient // GetSystemUserClientRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientRequestClient // GetSystemUserClientRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> ApproveSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/clientRequest/{partyId}/{clientRequestId}/approve";
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpoint, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    
                
                if (response.IsSuccessStatusCode) 
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientRequestClient // ApproveSystemUserClientRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientRequestClient // ApproveSystemUserClientRequest // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Result<bool>> RejectSystemUserClientRequest(int partyId, Guid clientRequestId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpoint = $"systemuser/clientRequest/{partyId}/{clientRequestId}/reject";
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpoint, null);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);    
                
                if (response.IsSuccessStatusCode) 
                {
                    return true;
                }

                _logger.LogError("AccessManagement.UI // SystemUserClientRequestClient // RejectSystemUserClientRequest // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                
                AltinnProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<AltinnProblemDetails>(cancellationToken);
                return ProblemMapper.MapToAuthUiError(problemDetails?.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemUserClientRequestClient // RejectSystemUserClientRequest // Exception");
                throw;
            }
        }
    }
}