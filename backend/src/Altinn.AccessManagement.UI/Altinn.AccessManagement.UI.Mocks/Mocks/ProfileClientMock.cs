using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;
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

        private static string GetDataPathForProfiles()
        {
            string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(folder, "Data", "Profile", "userprofiles.json");
        }
    }
}
