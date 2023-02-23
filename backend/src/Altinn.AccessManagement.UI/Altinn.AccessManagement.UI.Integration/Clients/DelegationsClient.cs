using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.Common.AccessTokenClient.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client that integrates with Delegations API
    /// </summary>
    public class DelegationsClient : IDelegationsClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenGenerator _accessTokenGenerator;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationsClient"/> class
        /// </summary>
        public DelegationsClient(
            HttpClient httpClient, 
            ILogger<DelegationsClient> logger, 
            IHttpContextAccessor httpContextAccessor, 
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenGenerator accessTokenGenerator) 
        {
            _logger = logger;
            httpClient.BaseAddress = new Uri(platformSettings.Value.PlatformApiBaseUrl);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            _accessTokenGenerator = accessTokenGenerator;
        }

        /// <inheritdoc/>
        public async Task<List<Delegation>> GetInboundDelegations(string party)
        {
            try
            {
                string endpointUrl = $"accessmanagement/api/v1/{party}/delegations/maskinportenschema/received";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);

                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                    };
                    options.Converters.Add(new JsonStringEnumConverter());
                    List<Delegation> inboundDelegations = JsonSerializer.Deserialize<List<Delegation>>(responseContent, options);
                    return inboundDelegations;
                }
                else
                {
                    _logger.LogError("Getting party information from bridge failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement // PartiesClient // GetPartyAsync // Exception");
                throw;
            }

            return null;
        }

        /// <inheritdoc/>
        public async Task<List<Delegation>> GetOutboundDelegations(string party)
        {
            try
            {
                string endpointUrl = $"accessmanagement/api/v1/{party}/delegations/maskinportenschema/offered";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);

                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                    };
                    options.Converters.Add(new JsonStringEnumConverter());
                    List<Delegation> outboundDelegations = JsonSerializer.Deserialize<List<Delegation>>(responseContent, options);
                    return outboundDelegations;
                }
                else
                {
                    _logger.LogError("Getting party information from bridge failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement // PartiesClient // GetPartyAsync // Exception");
                throw;
            }

            return null;
        }
    }
}
