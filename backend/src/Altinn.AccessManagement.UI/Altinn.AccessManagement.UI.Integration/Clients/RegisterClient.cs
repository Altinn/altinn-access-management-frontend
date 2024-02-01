using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Platform.Register.Models;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// client that integrates with the platform register api
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class RegisterClient : IRegisterClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterClient"/> class
        /// </summary>
        /// <param name="httpClient">http client</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public RegisterClient(
            HttpClient httpClient,
            ILogger<RegisterClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider) 
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiRegisterEndpoint);            
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _accessTokenProvider = accessTokenProvider;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
        }

        /// <inheritdoc/>
        public async Task<Party> GetPartyForOrganization(string organizationNumber)
        {
            try
            {
                string endpointUrl = $"parties/lookup";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                StringContent requestBody = new StringContent(JsonSerializer.Serialize(new PartyLookup { OrgNo = organizationNumber }, _serializerOptions), Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody, accessToken);
                string responseContent = await response.Content.ReadAsStringAsync();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return JsonSerializer.Deserialize<Party>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // RegisterClient // GetPartyForOrganization // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RegisterClient // GetPartyForOrganization // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<List<Party>> GetPartyListByUUID(List<Guid> uuidList)
        {
            try
            {
                string endpointUrl = $"parties/partylistbyuuid";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                StringContent requestBody = new StringContent(JsonSerializer.Serialize(uuidList, _serializerOptions), Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody, accessToken);
                string responseContent = await response.Content.ReadAsStringAsync();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return JsonSerializer.Deserialize<List<Party>>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // RegisterClient // GetPartyForOrganization // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RegisterClient // GetPartyForOrganization // Exception");
                throw;
            }
        }
    }
}
