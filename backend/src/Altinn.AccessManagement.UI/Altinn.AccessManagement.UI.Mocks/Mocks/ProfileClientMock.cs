using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IProfileClient"></see> interface
    /// </summary>
    public class ProfileClientMock : IProfileClient
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="ProfileClientMock" /> class
        /// </summary>
        public ProfileClientMock(
            HttpClient httpClient,
            ILogger<ProfileClientMock> logger,
            IHttpContextAccessor httpContextAccessor,
            IAccessTokenProvider accessTokenProvider)
        {
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
        public async Task<UserProfile> GetUserProfile(Guid uuid)
        {
            UserProfile profile = null;
            string path = GetDataPathForProfiles();
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                List<UserProfile> allProfiles = (List<UserProfile>)JsonSerializer.Deserialize(content, typeof(List<UserProfile>), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                profile = allProfiles.FirstOrDefault(p => p.UserUuid == uuid);
            }

            return await Task.FromResult(profile);
        }

        private static string GetDataPathForProfiles()
        {
            string? mockClientFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(mockClientFolder, "Data", "Profile", "userprofiles.json");
        }
    }
}
