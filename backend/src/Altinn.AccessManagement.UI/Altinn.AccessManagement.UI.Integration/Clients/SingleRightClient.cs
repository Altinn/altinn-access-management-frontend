using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <inheritdoc />
    public class SingleRightClient : ISingleRightClient
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
        ///     Initializes a new instance of the <see cref="SingleRightClient" />
        /// </summary>
        public SingleRightClient(
            IHttpContextAccessor httpContextAccessor,
            HttpClient httpClient,
            IOptions<PlatformSettings> platformSettings,
            ILogger<MaskinportenSchemaClient> logger)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            _httpContextAccessor = httpContextAccessor;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            _client = httpClient;
        }

        /// <inheritdoc />
        public async Task<List<DelegationResponseData>> CheckDelegationAccess(string partyId, Right request)
        {
            try
            {
                string endpointUrl = $"{partyId}/rights/delegation/delegationcheck";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(request, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    // TODO: TEEEEEEEST !!!!!!!!!!!!!!!!!!
                    string responseContent = "[{\"rightKey\":\"oedresource_for_k6test:read\",\"resource\":[{\"id\":\"urn:altinn:resource\",\"value\":\"oedresource_for_k6test\"}],\"action\":\"read\",\"status\":\"Delegable\",\"details\":[{\"code\":\"RoleAccess\",\"description\":\"Delegator have access through having one of the following role(s) for the reportee party: urn:altinn:rolecode:REGNA, urn:altinn:rolecode:DAGL. Note: if the user is a Main Administrator (HADM) the user might not have direct access to the role other than for delegation purposes.\",\"parameters\":{\"RoleRequirementsMatches\":\"urn:altinn:rolecode:REGNA, urn:altinn:rolecode:DAGL\"}}]},{\"rightKey\":\"oedresource_for_k6test:write\",\"resource\":[{\"id\":\"urn:altinn:resource\",\"value\":\"oedresource_for_k6test\"}],\"action\":\"write\",\"status\":\"Delegable\",\"details\":[{\"code\":\"RoleAccess\",\"description\":\"Delegator have access through having one of the following role(s) for the reportee party: urn:altinn:rolecode:REGNA, urn:altinn:rolecode:DAGL. Note: if the user is a Main Administrator (HADM) the user might not have direct access to the role other than for delegation purposes.\",\"parameters\":{\"RoleRequirementsMatches\":\"urn:altinn:rolecode:REGNA, urn:altinn:rolecode:DAGL\"}}]},{\"rightKey\":\"oedresource_for_k6test:fire_rocket\",\"resource\":[{\"id\":\"urn:altinn:resource\",\"value\":\"oedresource_for_k6test\"}],\"action\":\"fire_rocket\",\"status\":\"Delegable\",\"details\":[{\"code\":\"RoleAccess\",\"description\":\"Delegator have access through having one of the following role(s) for the reportee party: urn:altinn:rolecode:REGNA, urn:altinn:rolecode:DAGL. Note: if the user is a Main Administrator (HADM) the user might not have direct access to the role other than for delegation purposes.\",\"parameters\":{\"RoleRequirementsMatches\":\"urn:altinn:rolecode:REGNA, urn:altinn:rolecode:DAGL\"}}]}]"; // = await response.Content.ReadAsStringAsync();
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
                _logger.LogError(ex, "AccessManagement.UI // DelegationsClient // UserDelegationAccessCheck // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation)
        {
            string endpointUrl = $"{party}/rights/delegation/offered";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(delegation, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            return response;
        }
    }
}
