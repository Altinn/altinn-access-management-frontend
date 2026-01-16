using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IProfileClient"></see> interface
    /// </summary>
    public class ProfileClientMock : IProfileClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string dataFolder;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        ///     Initializes a new instance of the <see cref="ProfileClientMock" /> class
        /// </summary>
        public ProfileClientMock(
            HttpClient httpClient,
            ILogger<ProfileClientMock> logger,
            IHttpContextAccessor httpContextAccessor,
            IAccessTokenProvider accessTokenProvider)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public async Task<UserProfile> GetUserProfile(int userId)
        {
            UserProfile profile = null;
            string path = GetDataPathForProfiles();
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                List<UserProfile> allProfiles = (List<UserProfile>)JsonSerializer.Deserialize(content, typeof(List<UserProfile>), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                profile = allProfiles.FirstOrDefault(p => p.UserId == userId);
            }

            return await Task.FromResult(profile);
        }

        /// <inheritdoc />
        public Task<UserProfile> GetUserProfile(Guid uuid)
        {
            string path = GetDataPathForProfiles();
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                List<UserProfile> allProfiles = (List<UserProfile>)JsonSerializer.Deserialize(content, typeof(List<UserProfile>), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return Task.FromResult(allProfiles.FirstOrDefault(p => p.UserUuid == uuid));
            }

            return Task.FromResult<UserProfile>(null);
        }

        /// <inheritdoc />
        public async Task<ProfileSettingPreference> PatchCurrentUserProfileSetting(ProfileSettingPreference settingsChange)
        {
            // Use fallback userUuid as suggested
            var userUuid = new Guid("167536b5-f8ed-4c5a-8f48-0279507e53ae");

            string path = GetDataPathForProfiles();
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                List<UserProfile> allProfiles = (List<UserProfile>)JsonSerializer.Deserialize(content, typeof(List<UserProfile>), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var userProfile = allProfiles.FirstOrDefault(p => p.UserUuid == userUuid);
                if (userProfile?.ProfileSettingPreference != null)
                {
                    // Create a copy of the existing ProfileSettingPreference
                    var result = new ProfileSettingPreference
                    {
                        Language = userProfile.ProfileSettingPreference.Language,
                        PreSelectedPartyId = userProfile.ProfileSettingPreference.PreSelectedPartyId,
                        DoNotPromptForParty = userProfile.ProfileSettingPreference.DoNotPromptForParty,
                        PreselectedPartyUuid = userProfile.ProfileSettingPreference.PreselectedPartyUuid,
                        ShowClientUnits = userProfile.ProfileSettingPreference.ShowClientUnits,
                        ShouldShowSubEntities = userProfile.ProfileSettingPreference.ShouldShowSubEntities,
                        ShouldShowDeletedEntities = userProfile.ProfileSettingPreference.ShouldShowDeletedEntities
                    };

                    // Apply changes (overwrite existing values)
                    if (settingsChange.Language != null)
                        result.Language = settingsChange.Language;
                    if (settingsChange.PreSelectedPartyId.HasValue)
                        result.PreSelectedPartyId = settingsChange.PreSelectedPartyId;
                    if (settingsChange.DoNotPromptForParty.HasValue)
                        result.DoNotPromptForParty = settingsChange.DoNotPromptForParty;
                    if (settingsChange.PreselectedPartyUuid.HasValue)
                        result.PreselectedPartyUuid = settingsChange.PreselectedPartyUuid;
                    if (settingsChange.ShowClientUnits.HasValue)
                        result.ShowClientUnits = settingsChange.ShowClientUnits;
                    // ShouldShowSubEntities is not nullable, so always apply
                    result.ShouldShowSubEntities = settingsChange.ShouldShowSubEntities;
                    if (settingsChange.ShouldShowDeletedEntities.HasValue)
                        result.ShouldShowDeletedEntities = settingsChange.ShouldShowDeletedEntities;

                    return await Task.FromResult(result);
                }
            }

            // Return the settingsChange as-is if no existing profile found
            return await Task.FromResult(settingsChange);
        }

        /// <inheritdoc/>
        public async Task<List<NotificationAddressResponse>> GetOrgNotificationAddresses(string orgNumber)
        {
            // Special string triggers backend style error for tests
            if (orgNumber == "000000000")
            {
                throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", HttpStatusCode.InternalServerError, string.Empty);
            }
            string dataPath = Path.Combine(dataFolder, "Profile", "NotificationAddresses", $"{orgNumber}.json");
            try
            {
                var mock = Util.GetMockData<OrganizationResponse>(dataPath);
                return await Task.FromResult(mock.NotificationAddresses);
            }
            catch
            {
                // Fallback to null if file not found
                return null;
            }
        }

        public async Task<NotificationAddressResponse> PostNewOrganisationNotificationAddress(string orgNumber, NotificationAddressModel notificationAddress)
        {
            // Special string triggers backend style error for tests
            if (orgNumber == "000000000")
            {
                throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", HttpStatusCode.InternalServerError, string.Empty);
            }
            NotificationAddressResponse response = new NotificationAddressResponse
            {
                Email = notificationAddress.Email,
                Phone = notificationAddress.Phone,
                CountryCode = notificationAddress.CountryCode,
                NotificationAddressId = 12345
            };

            return await Task.FromResult(response);
        }

        public async Task<NotificationAddressResponse> DeleteOrganisationNotificationAddress(string orgNumber, int notificationAddressId)
        {
            // Special string triggers backend style error for tests
            if (orgNumber == "000000000")
            {
                throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", HttpStatusCode.InternalServerError, string.Empty);
            }

            NotificationAddressResponse response;
            if (notificationAddressId == 12345)
            {
                response = new NotificationAddressResponse
                {
                    Email = "test@testemail.com",
                    Phone = "123456789",
                    CountryCode = "+47",
                    NotificationAddressId = 12345
                };
            }
            else
            {
                throw new HttpStatusException("NotFound", "The specified notification address was not found", HttpStatusCode.NotFound, string.Empty);
            }

            return await Task.FromResult(response);
        }

        public async Task<NotificationAddressResponse> UpdateOrganisationNotificationAddress(string orgNumber, int notificationAddressId, NotificationAddressModel notificationAddress)
        {
            // Special string triggers backend style error for tests
            if (orgNumber == "000000000")
            {
                throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", HttpStatusCode.InternalServerError, string.Empty);
            }

            if (notificationAddressId < 10000)
            {
                throw new HttpStatusException("NotFound", "The specified notification address was not found", HttpStatusCode.NotFound, string.Empty);
            }

            NotificationAddressResponse response = new NotificationAddressResponse
            {
                Email = notificationAddress.Email,
                Phone = notificationAddress.Phone,
                CountryCode = notificationAddress.CountryCode,
                NotificationAddressId = notificationAddressId
            };

            return await Task.FromResult(response);
        }

        /// <inheritdoc/>
        public async Task<ProfileGroup> GetFavoriteProfileGroup()
        {
            // Check authentication context for special test scenarios
            var httpContext = _httpContextAccessor?.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated == true)
            {
                var partyUuid = AuthenticationHelper.GetUserPartyUuid(_httpContextAccessor.HttpContext);
                // Special test scenario for 500 - internal server error
                if (partyUuid == Guid.Empty)
                {
                    throw new HttpRequestException("Internal server error");
                }

                // Special test scenario for 404 - user not found
                if (partyUuid == new Guid("00000000-0000-0000-0000-000000000404"))
                {
                    return null;
                }

                // Special test scenario for empty favorites list
                if (partyUuid == new Guid("51329012-0000-0000-0000-000000000000"))
                {
                    var emptyResponse = new ProfileGroup
                    {
                        Name = "__favoritter__",
                        IsFavorite = true,
                        Parties = new List<string>()
                    };
                    return await Task.FromResult(emptyResponse);
                }
            }

            // Default response for valid user (20004938 -> cd35779b-b174-4ecc-bbef-ece13611be7f)
            var response = new ProfileGroup
            {
                Name = "__favoritter__",
                IsFavorite = true,
                Parties = new List<string> {
                "cd35779b-b174-4ecc-bbef-ece13611be7f", "167536b5-f8ed-4c5a-8f48-0279507e53ae" }
            };

            return await Task.FromResult(response);
        }

        /// <inheritdoc/>
        public async Task AddPartyUuidToFavorites(Guid partyUuid)
        {
            if (partyUuid == Guid.Empty)
            {
                throw new HttpRequestException("Internal server error");
            }

            await Task.CompletedTask;
        }

        /// <inheritdoc/>
        public async Task DeletePartyUuidFromFavorites(Guid partyUuid)
        {
            if (partyUuid == Guid.Empty)
            {
                throw new HttpRequestException("Internal server error");
            }

            await Task.CompletedTask;
        }

        private static string GetDataPathForProfiles()
        {
            string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(folder, "Data", "Profile", "userprofiles.json");
        }
    }
}
