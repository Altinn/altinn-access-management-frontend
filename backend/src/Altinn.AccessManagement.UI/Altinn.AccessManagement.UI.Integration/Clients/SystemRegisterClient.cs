using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    ///     Client implementation for integration with the System Register
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SystemRegisterClient : ISystemRegisterClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;
        private readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemRegisterClient"/> class.
        /// </summary>
        /// <param name="httpClient">http client</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public SystemRegisterClient(
            HttpClient httpClient, 
            ILogger<SystemRegisterClient> logger,
            IHttpContextAccessor httpContextAccessor, 
            IOptions<PlatformSettings> platformSettings, 
            IAccessTokenProvider accessTokenProvider)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            _accessTokenProvider = accessTokenProvider;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAuthenticationEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _httpClient = httpClient;
        }

        /// <inheritdoc/>
        public async Task<List<RegisteredSystem>> GetSystems(CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemregister";
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl, accessToken);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<List<RegisteredSystem>>(responseContent, _jsonSerializerOptions);
                }
                
                _logger.LogError("AccessManagement.UI // SystemRegisterClient // GetSystems // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemRegisterClient // GetSystems // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<RegisteredSystem> GetSystem(string systemId, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"systemregister/{systemId}";
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl, accessToken);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<RegisteredSystem>(responseContent, _jsonSerializerOptions);   
                }

                _logger.LogError("AccessManagement.UI // SystemRegisterClient // GetSystem // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SystemRegisterClient // GetSystem // Exception");
                throw;
            }
        }
    }
}
