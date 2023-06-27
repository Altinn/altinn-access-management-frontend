using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;
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
        public async Task<List<DelegationAccessCheckResponse>> UserDelegationAccessCheck(string partyId, CheckDelegationAccessDto request)
        {
            try
            {
                string endpointUrl = $"{partyId}/rights/delegation/userdelegationcheck";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(request, _serializerOptions), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<List<DelegationAccessCheckResponse>>(responseContent, _serializerOptions);
                }

                if (response.StatusCode == HttpStatusCode.BadRequest)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    HttpErrorResponse errorObject = JsonSerializer.Deserialize<HttpErrorResponse>(responseContent, _serializerOptions);

                    Resource resource = new Resource(request.Resource.Id, request.Resource.Value);
                    List<Resource> resources = new List<Resource>();
                    resources.Add(resource);

                    var errorReponseList = new List<DelegationAccessCheckResponse>
                    {
                        new DelegationAccessCheckResponse(string.Empty, resources, string.Empty, string.Empty, string.Empty, string.Empty, new List<Role>(), errorObject),
                    };
                    return errorReponseList;
                }
                
                _logger.LogError("Checking delegation accesses failed with {StatusCode}", response.StatusCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // DelegationsClient // UserDelegationAccessCheck // Exception");
                throw;
            }
        }
    }
}