using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.Platform.Profile.Models;

namespace Altinn.AccessManagement.UI.Tests.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IProfileClient"></see> interface
    /// </summary>
    public class ProfileClientMock : IProfileClient
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileClientMock"/> class
        /// </summary>
        public ProfileClientMock()
        {
        }

        /// <inheritdoc/>
        public async Task<UserProfile> GetUserProfile()
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
            string? unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data", "Profile", "userprofile.json");
        }
    }
}
