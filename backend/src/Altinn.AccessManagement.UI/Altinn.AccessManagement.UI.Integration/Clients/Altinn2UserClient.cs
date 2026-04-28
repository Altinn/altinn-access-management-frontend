using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.AccessManagement.UI.Integration.Configuration;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for adding legacy Altinn 2 user accounts via the Altinn Authentication platform API.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class Altinn2UserClient : IAltinn2UserClient
    {
        private readonly ILogger _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly HttpClient _httpClient;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="Altinn2UserClient"/> class.
        /// </summary>
        public Altinn2UserClient(
            IOptions<PlatformSettings> platformSettings,
            ILogger<Altinn2UserClient> logger,
            IHttpContextAccessor httpContextAccessor,
            HttpClient httpClient)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAuthenticationEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _httpClient = httpClient;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> AddAltinn2User(Altinn2UserRequest request)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = "altinn2user";

                var content = JsonContent.Create(request);
                HttpResponseMessage response = await _httpClient.PostAsync(token, endpointUrl, content);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagementUI // Altinn2UserClient // AddAltinn2User // Exception");
                throw;
            }
        }
    }
}
