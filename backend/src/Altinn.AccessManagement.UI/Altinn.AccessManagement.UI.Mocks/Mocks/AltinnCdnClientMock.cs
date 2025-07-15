#nullable enable

using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

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

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnClientMock"/> class with dependencies
        /// </summary>
        /// <param name="httpClient">The HTTP client (not used in mock)</param>
        /// <param name="logger">The logger (not used in mock)</param>
        /// <param name="httpContextAccessor">The HTTP context accessor (not used in mock)</param>
        /// <param name="accessTokenProvider">The access token provider (not used in mock)</param>
        public AltinnCdnClientMock(
            HttpClient httpClient,
            ILogger<AltinnCdnClientMock> logger,
            IHttpContextAccessor httpContextAccessor,
            IAccessTokenProvider accessTokenProvider)
        {
            // Parameters not used in mock implementation
        }

        /// <inheritdoc/>
        public async Task<Dictionary<string, OrgData>> GetOrgData()
        {
            var orgData = new Dictionary<string, OrgData>();

            string testDataPath = GetDataPath();

            if (File.Exists(testDataPath))
            {
                string content = await File.ReadAllTextAsync(testDataPath);
                var rawData = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, OrgData>>>(content, _options);

                if (rawData != null && rawData.TryGetValue("orgs", out var innerOrgData) && innerOrgData != null)
                {
                    orgData = innerOrgData;
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
            string folder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath) ?? string.Empty;
            return Path.Combine(folder, "Data", "AltinnCdn", "altinn-orgs.json");
        }
    }
}
