using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Proxy implementation for parties
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class LookupClient : ILookupClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenGenerator _accessTokenGenerator;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupClient"/> class
        /// </summary>
        /// <param name="httpClient">HttpClient from default httpclientfactory</param>
        /// <param name="sblBridgeSettings">the sbl bridge settings</param>
        /// <param name="logger">the logger</param>
        /// <param name="httpContextAccessor">handler for http context</param>
        /// <param name="platformSettings">the platform setttings</param>
        /// <param name="accessTokenGenerator">An instance of the AccessTokenGenerator service.</param>
        public LookupClient(
            HttpClient httpClient, 
            ILogger<LookupClient> logger, 
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
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
        }

        /// <inheritdoc/>
        public async Task<Party> GetOrganisation(string organisationNumber)
        {
            Party party = null;
            try
            {
                string endpointUrl = $"accessmanagement/api/v1/lookup/org/{organisationNumber}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");
                
                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);

                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    party = JsonSerializer.Deserialize<Party>(responseContent, _serializerOptions);
                    return party;
                }
                else
                {
                    _logger.LogError("Getting organisation information from accessmanagement failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // LookupClient // GetOrganisation // Exception");
                throw;
            }

            return party;
        }

        /// <inheritdoc/>
        public async Task<Party> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                string endpointUrl = $"accessmanagement/api/v1/lookup/reportee/{partyId}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);

                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    
                    Party partyInfo = JsonSerializer.Deserialize<Party>(responseContent, _serializerOptions);
                    return partyInfo;
                }
                else
                {
                    _logger.LogError("GetPartyFromReporteeListIfExists from accessmanagement failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // LookupClient // GetPartyFromReporteeListIfExists // Exception");
                throw;
            }

            return null;
        }
    }
}
