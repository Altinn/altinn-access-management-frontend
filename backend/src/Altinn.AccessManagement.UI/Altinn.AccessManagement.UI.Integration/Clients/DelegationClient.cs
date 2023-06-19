using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
namespace Altinn.AccessManagement.UI.Integration.Clients
{

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

        public DelegationClient(
            IHttpContextAccessor httpContextAccessor,
            HttpClient httpClient,
            IOptions<PlatformSettings> platformSettings,
            ILogger<MaskinportenSchemaClient> logger
        )
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            _httpContextAccessor = httpContextAccessor;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            _client = httpClient;
        }

        /// <inheritdoc />
        public async Task<bool> UserDelegationCheck(string partyId, SingleRightDelegationInputDto request)
        {
            string endpointUrl = $"{partyId}/rights/delegation/userdelegationcheck";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(request, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

            return true;
        }
    }
}
