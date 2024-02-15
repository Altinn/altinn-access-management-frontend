using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Platform.Profile.Models;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// client that integrates with the platform profile api
    /// </summary>
    public class ProfileClient : IProfileClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public ProfileClient(
            HttpClient httpClient,
            ILogger<ProfileClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider) 
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiProfileEndpoint);            
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _accessTokenProvider = accessTokenProvider;
        }

        /// <inheritdoc/>
        public async Task<UserProfile> GetUserProfile(int userId)
        {
            UserProfile userProfile = null;
            try
            {
                string endpointUrl = $"users/{userId}";
                userProfile = await GetUserProfileFromEndpoint(endpointUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // GetUserProfile // Exception");
                throw;
            }

            return userProfile;
        }

        /// <inheritdoc/>
        public async Task<UserProfile> GetUserProfile(Guid uuid)
        {
            UserProfile userProfile = null;
            try
            {
                string endpointUrl = $"users/byuuid/{uuid}";
                userProfile = await GetUserProfileFromEndpoint(endpointUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // GetUserProfile // Exception");
                throw;
            }

            return userProfile;
        }

        private async Task<UserProfile> GetUserProfileFromEndpoint(string endpointUrl)
        {
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var accessToken = await _accessTokenProvider.GetAccessToken();

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };
                options.Converters.Add(new JsonStringEnumConverter());
                UserProfile userProfile = JsonSerializer.Deserialize<UserProfile>(responseContent, options);
                return userProfile;
            }
            else
            {
                _logger.LogError($"Getting user profile information from platform failed with statuscode {response.StatusCode}");
                return null;
            }
        }
    }
}
