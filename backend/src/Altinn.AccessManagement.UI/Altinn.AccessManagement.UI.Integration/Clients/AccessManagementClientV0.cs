using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    ///     Client that integrates with MaskinportenSchema API
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class AccessManagementClientV0 : IAccessManagementClientV0
    {
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly PlatformSettings _platformSettings;

        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementClient" /> class
        /// </summary>
        public AccessManagementClientV0(
            HttpClient httpClient,
            ILogger<AccessManagementClient> logger,
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

        /// <inheritdoc />
        public async Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                string endpointUrl = $"authorizedparty/{partyId}?includeAltinn2=true";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<AuthorizedParty>(responseContent, _serializerOptions);
                }

                _logger.LogError("GetPartyFromReporteeListIfExists from accessmanagement failed with {StatusCode}", response.StatusCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // AccessManagementClient // GetPartyFromReporteeListIfExists // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<AuthorizedParty>> GetReporteeListForUser()
        {
            try
            {
                string endpointUrl = $"authorizedparties?includeAltinn2=true";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<List<AuthorizedParty>>(responseContent, _serializerOptions);
                }

                _logger.LogError("GetPartyFromReporteeListIfExists from accessmanagement failed with {StatusCode}", response.StatusCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // AccessManagementClient // GetPartyFromReporteeListIfExists // Exception");
                throw;
            }
        }


        /// <inheritdoc />
        public async Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient)
        {
            string endpointUrl = $"internal/{party}/accesscache/clear";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(recipient, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PutAsync(token, endpointUrl, requestBody);
            return response;
        }

        //// MaskinportenSchema

        /// <inheritdoc />
        public async Task<List<MaskinportenSchemaDelegation>> GetReceivedMaskinportenSchemaDelegations(string party)
        {
            try
            {
                string endpointUrl = $"{party}/maskinportenschema/received";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    List<MaskinportenSchemaDelegation> inboundDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(responseContent, _serializerOptions);
                    return inboundDelegations;
                }

                _logger.LogError("Getting received delegations from accessmanagement failed with {StatusCode}", response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // MaskinportenSchemaClient // GetInboundDelegations // Exception");
                throw;
            }

            return null;
        }

        /// <inheritdoc />
        public async Task<List<MaskinportenSchemaDelegation>> GetOfferedMaskinportenSchemaDelegations(string party)
        {
            try
            {
                string endpointUrl = $"{party}/maskinportenschema/offered";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    List<MaskinportenSchemaDelegation> outboundDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegation>>(responseContent, _serializerOptions);
                    return outboundDelegations;
                }

                _logger.LogError("Getting offered delegations from accessmanagement failed with {StatusCode}", response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // DelegationsClient // GetOutboundDelegations // Exception");
                throw;
            }

            return null;
        }

        /// <inheritdoc />
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

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation)
        {
            string endpointUrl = $"{party}/maskinportenschema/offered/revoke";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            return response;
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation)
        {
            string endpointUrl = $"{party}/maskinportenschema/offered";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            return response;
        }

        /// <inheritdoc />
        public async Task<List<DelegationResponseData>> MaskinportenSchemaDelegationCheck(string partyId, Right request)
        {
            try
            {
                string endpointUrl = $"{partyId}/maskinportenschema/delegationcheck";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(request, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<List<DelegationResponseData>>(responseContent, _serializerOptions);
                }
                else
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(responseContent, _serializerOptions);

                    throw error;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // MaskinportenSchemaClient // DelegationCheck // Exception");
                throw;
            }
        }

        //// SingleRights

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CheckSingleRightsDelegationAccess(string partyId, Right request)
        {
            try
            {
                string endpointUrl = $"internal/{partyId}/rights/delegation/delegationcheck";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(request, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // SingleRightClient // CheckDelegationAccess // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateSingleRightsDelegation(string party, DelegationInput delegation)
        {
            string endpointUrl = $"internal/{party}/rights/delegation/offered";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            return response;
        }
    }
}
