#nullable enable

using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IAltinnCdnClient"/> interface
    /// </summary>
    public class AltinnCdnClientMock : IAltinnCdnClient
    {
        private static readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnClientMock"/> class
        /// </summary>
        public AltinnCdnClientMock()
        {
        }

        /// <inheritdoc/>
        public async Task<Dictionary<string, OrgData>> GetOrgData()
        {
            var orgData = new Dictionary<string, OrgData>(StringComparer.OrdinalIgnoreCase);

            string testDataPath = GetDataPath();

            if (File.Exists(testDataPath))
            {
                string content = await File.ReadAllTextAsync(testDataPath);
                var rawData = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, OrgData>>>(content, _options);

                if (rawData != null && rawData.TryGetValue("orgs", out var innerOrgData) && innerOrgData != null)
                {
                    orgData = new Dictionary<string, OrgData>(innerOrgData, StringComparer.OrdinalIgnoreCase);
                }
            }
            return orgData;
        }

        /// <summary>
        /// Gets the path to the test data file
        /// </summary>
        /// <returns>The path to the altinn-orgs.json test data file</returns>
        private static string GetDataPath()
        {
            string folder = Path.GetDirectoryName(new Uri(typeof(AltinnCdnClientMock).Assembly.Location).LocalPath) ?? string.Empty;
            return Path.Combine(folder, "Data", "AltinnCdn", "altinn-orgs.json");
        }
    }
}
