using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate.SingleRightDelegationInputDto;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <inheritdoc />
    public class DelegationClient : IDelegationClient
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
        ///     Initializes a new instance of the <see cref="DelegationClient" /> class
        /// </summary>
        public DelegationClient(
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
        public List<DelegationCapabiltiesResponse> UserDelegationAccessCheck(string partyId, SingleRightDelegationInputDto request)
        {
            /* Remove outcommented code when integrating with backend
            try
            {
                string endpointUrl = $"{partyId}/rights/delegation/userdelegationcheck";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(request, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<List<DelegationCapabiltiesResponse>>(responseContent, _serializerOptions);
                }
                _logger.LogError("Checking delegation accesses failed with {StatusCode}", response.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // DelegationsClient // UserDelegationAccessCheck // Exception");
                throw;
            }
             */
            // Delete line below when integrating with backend
            return ProduceStaticCanDelegateResponse();
        }

        private List<DelegationCapabiltiesResponse> ProduceStaticCanDelegateResponse()
        {
            List<DelegationCapabiltiesResponse> responses = new List<DelegationCapabiltiesResponse>
            {
                new DelegationCapabiltiesResponse(
                    "ttd-am-k6/read",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "read",
                    "Delegable",
                    string.Empty,
                    string.Empty,
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationCapabiltiesResponse(
                    "ttd-am-k6/write",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "write",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
                new DelegationCapabiltiesResponse(
                "ttd-am-k6/sign",
                    new List<Resource>
                    {
                        new Resource(
                            "urn:altinn:resource",
                            "ttd-am-k6"),
                    },
                    "sign",
                    "NotDelegable",
                    "UserMissingRight",
                    "User does not match any of the required role requirements (DAGL, REGNA)",
                    new List<Role>
                    {
                        new Role("RoleRequirements", "DAGL, REGNA"),
                    }),
            };

            return responses;
        }
    }
}
