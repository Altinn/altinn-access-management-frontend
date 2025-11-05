using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
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
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

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

        /// <inheritdoc/>
        public async Task<List<NotificationAddressResponse>> GetOrgNotificationAddresses(string orgNumber)
        {
            try
            {
                string endpointUrl = $"organizations/{orgNumber}/notificationaddresses/mandatory";
                string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);

                var resString = await response.Content.ReadAsStringAsync();
                OrganizationResponse orgNotifications = await ClientUtils.DeserializeIfSuccessfullStatusCode<OrganizationResponse>(response);
                return orgNotifications?.NotificationAddresses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // GetOrgNotificationAddresses // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<NotificationAddressResponse> PostNewOrganisationNotificationAddress(string orgNumber, NotificationAddressModel notificationAddress)
        {
            try
            {
                string endpointUrl = $"organizations/{orgNumber}/notificationaddresses/mandatory";
                string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                StringContent requestBody = new StringContent(JsonSerializer.Serialize(notificationAddress, _serializerOptions), Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody, accessToken);

                var resString = await response.Content.ReadAsStringAsync();
                NotificationAddressResponse orgNotification = await ClientUtils.DeserializeIfSuccessfullStatusCode<NotificationAddressResponse>(response);
                return orgNotification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // PostNewOrganisationNotificationAddress // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<NotificationAddressResponse> DeleteOrganisationNotificationAddress(string orgNumber, int notificationAddressId)
        {
            try
            {
                string endpointUrl = $"organizations/{orgNumber}/notificationaddresses/mandatory/{notificationAddressId}";
                string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl, accessToken);

                var resString = await response.Content.ReadAsStringAsync();
                NotificationAddressResponse orgNotification = await ClientUtils.DeserializeIfSuccessfullStatusCode<NotificationAddressResponse>(response);
                return orgNotification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // DeleteOrganisationNotificationAddress // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<NotificationAddressResponse> UpdateOrganisationNotificationAddress(string orgNumber, int notificationAddressId, NotificationAddressModel notificationAddress)
        {
            try
            {
                string endpointUrl = $"organizations/{orgNumber}/notificationaddresses/mandatory/{notificationAddressId}";
                string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                StringContent requestBody = new StringContent(JsonSerializer.Serialize(notificationAddress, _serializerOptions), Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _client.PutAsync(token, endpointUrl, requestBody, accessToken);

                var resString = await response.Content.ReadAsStringAsync();
                NotificationAddressResponse orgNotification = await ClientUtils.DeserializeIfSuccessfullStatusCode<NotificationAddressResponse>(response);
                return orgNotification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // UpdateOrganisationNotificationAddress // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<ProfileGroup> GetFavoriteProfileGroup()
        {
            try
            {
                string endpointUrl = $"users/current/party-groups/favorites";
                string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);

                var resString = await response.Content.ReadAsStringAsync();
                ProfileGroup profileGroups = await ClientUtils.DeserializeIfSuccessfullStatusCode<ProfileGroup>(response);
                return profileGroups;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // GetFavoriteProfileGroup // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task AddPartyUuidToFavorites(Guid partyUuid)
        {
            try
            {
                string endpointUrl = $"users/current/party-groups/favorites/{partyUuid}";
                string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _client.PutAsync(token, endpointUrl, null, accessToken);

                var resString = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpStatusException("Unexpected response from Profile", response.ReasonPhrase, response.StatusCode, string.Empty);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // AddPartyUuidToFavorites // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task DeletePartyUuidFromFavorites(Guid partyUuid)
        {
            try
            {
                string endpointUrl = $"users/current/party-groups/favorites/{partyUuid}";
                string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl, accessToken);

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpStatusException("Unexpected response from Profile", response.ReasonPhrase, response.StatusCode, string.Empty);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // ProfileClient // DeletePartyUuidFromFavorites // Exception");
                throw;
            }
        }

        private async Task<UserProfile> GetUserProfileFromEndpoint(string endpointUrl)
        {
            string token = AltinnCore.Authentication.Utils.JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
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
