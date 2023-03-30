using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Platform.Profile.Models;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// client that integrates with profile api in access management
    /// </summary>
    public class ProfileClient : IProfileClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenGenerator _accessTokenGenerator;
        private readonly IAccessTokenProvider _accessTokenProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenGenerator">the handler for access token generator</param>
        public ProfileClient(
            HttpClient httpClient,
            ILogger<ProfileClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenGenerator accessTokenGenerator,
            IAccessTokenProvider accessTokenProvider) 
        {
            _logger = logger;
            httpClient.BaseAddress = new Uri(platformSettings.Value.PlatformApiBaseUrl);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            _accessTokenGenerator = accessTokenGenerator;
            _accessTokenProvider = accessTokenProvider;
        }

        /// <inheritdoc/>
        public async Task<UserProfile> GetUserProfile()
        {
            try
            {
                string endpointUrl = $"accessmanagement/api/v1/profile/user";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();
                _logger.LogInformation($"access token test logging : {accessToken}");
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
                    _logger.LogError($"Getting user settings information from accessmanagement failed with statuscode {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // GetUSerProfile // Exception");
                throw;
            }

            return null;
        }
    }
}
