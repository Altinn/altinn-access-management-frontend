using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Web.Http.ModelBinding;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Common.AccessTokenClient.Services;
using Altinn.Platform.Register.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

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
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

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
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
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
                string endpointUrl = $"accessmanagement/api/v1/{party}/delegations/maskinportenschema/received/revoke";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody, accessToken);
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
                string endpointUrl = $"accessmanagement/api/v1/{party}/delegations/maskinportenschema/offered/revoke";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody, accessToken);
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
            string endpointUrl = $"accessmanagement/api/v1/{party}/delegations/maskinportenschema/";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var accessToken = _accessTokenGenerator.GenerateAccessToken("platform", "access-management");
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody, accessToken);
            return response;
        }
    }
}
