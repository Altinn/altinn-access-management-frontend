using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// client that integrates with the platform profile api
    /// </summary>
    public class AltinnCdnClient : IAltinnCdnClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        public AltinnCdnClient(
            HttpClient httpClient,
            ILogger<AltinnCdnClient> logger)
        {
            _logger = logger;
            _client = httpClient;
        }

        private readonly string altinnCdnUrl = "https://altinncdn.no/";
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <inheritdoc/>
        public async Task<Dictionary<string, OrgData>> GetOrgData()
        {
            var response = await _client.GetAsync($"{altinnCdnUrl}orgs/altinn-orgs.json", HttpCompletionOption.ResponseHeadersRead);
            response.EnsureSuccessStatusCode();
            string responseContent = await response.Content.ReadAsStringAsync();

            Dictionary<string, Dictionary<string, OrgData>> rawOrgData = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, OrgData>>>(responseContent, _jsonOptions);

            Dictionary<string, OrgData> orgData = new Dictionary<string, OrgData>();

            if (rawOrgData != null && rawOrgData.TryGetValue("orgs", out var innerOrgData) && innerOrgData != null)
            {
                orgData = innerOrgData;
            }
            else
            {
                _logger.LogError("Failed to deserialize org data or 'orgs' property is missing/null from {AltinnCdnUrl}", altinnCdnUrl);
            }

            return orgData;
        }
    }
}
