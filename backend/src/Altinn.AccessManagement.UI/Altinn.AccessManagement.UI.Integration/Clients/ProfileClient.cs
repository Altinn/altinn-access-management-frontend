﻿using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Platform.Profile.Models;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    public class ProfileClient : IProfileClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenGenerator _accessTokenGenerator;
        public ProfileClient(HttpClient httpClient,
            ILogger<ProfileClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenGenerator accessTokenGenerator) 
        {
            _logger = logger;
            httpClient.BaseAddress = new Uri(platformSettings.Value.PlatformApiBaseUrl);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            _accessTokenGenerator = accessTokenGenerator;
        }

        public async Task<UserProfile> GetUserProfile()
        {
            try
            {
                string endpointUrl = $"accessmanagement/api/v1/profile/user";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");

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
                    _logger.LogError("Getting user settings information from bridge failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement //UI // ProfileClient // GetUSerProfile // Exception");
                throw;
            }

            return null;
        }
    }
}
