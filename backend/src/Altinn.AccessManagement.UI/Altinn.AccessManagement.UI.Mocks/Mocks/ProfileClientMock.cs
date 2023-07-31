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
            string path = GetDataPathForProfile();
            if (File.Exists(path))
            {
                string content = File.ReadAllText(path);
                profile = (UserProfile)JsonSerializer.Deserialize(content, typeof(UserProfile), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            return await Task.FromResult(profile);
        }

        private static string GetDataPathForProfile()
        {
            string? mockClientFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(mockClientFolder, "Data", "Profile", "userprofile.json");
        }
    }
}
