using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// client that integrates with the platform profile api
    /// </summary>
    public class AltinnCdnClient : IAltinnCdnClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public AltinnCdnClient(
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
