using System.Diagnostics.CodeAnalysis;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client that integrates with MaskinportenSchema API
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class MaskinportenSchemaClient : IMaskinportenSchemaClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenSchemaClient"/> class
        /// </summary>
        public MaskinportenSchemaClient(
            HttpClient httpClient, 
            ILogger<MaskinportenSchemaClient> logger, 
            IHttpContextAccessor httpContextAccessor, 
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            _httpContextAccessor = httpContextAccessor;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            _client = httpClient;
        }

        /// <inheritdoc/>
        public async Task<List<MaskinportenSchemaDelegation>> GetReceivedMaskinportenSchemaDelegations(string party)
        {
            try
            {
                string endpointUrl = $"{party}/maskinportenschema/received";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    List<MaskinportenSchemaDelegation> inboundDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(responseContent, _serializerOptions);
                    return inboundDelegations;
                }
                else
                {
                    _logger.LogError("Getting received delegations from accessmanagement failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // DelegationsClient // GetInboundDelegations // Exception");
                throw;
            }

            return null;
        }

        /// <inheritdoc/>
        public async Task<List<MaskinportenSchemaDelegation>> GetOfferedMaskinportenSchemaDelegations(string party)
        {
            try
            {
                string endpointUrl = $"{party}/maskinportenschema/offered";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
                    
                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    List<MaskinportenSchemaDelegation> outboundDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(responseContent, _serializerOptions);
                    return outboundDelegations;
                }
                else
                {
                    _logger.LogError("Getting offered delegations from accessmanagement failed with {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // DelegationsClient // GetOutboundDelegations // Exception");
                throw;
            }

            return null;
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation)
        {
            try
            {
                string endpointUrl = $"{party}/maskinportenschema/received/revoke";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // DelegationsClient // RevokeReceivedMaskinportenScopeDelegation // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation)
        {
            try
            {
                string endpointUrl = $"{party}/maskinportenschema/offered/revoke";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
                return response;
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation)
        {
            string endpointUrl = $"{party}/maskinportenschema/offered";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            return response;
        }
    }
}
