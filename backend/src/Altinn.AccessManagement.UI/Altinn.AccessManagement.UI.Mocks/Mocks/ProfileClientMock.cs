using System.Net.Http.Headers;
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

        private static string GetDataPathForProfiles()
        {
            string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(folder, "Data", "Profile", "userprofiles.json");
        }
    }
}
