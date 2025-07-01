using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Altinn.Platform.Models.Register;
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
        public async Task<Party> GetPartyForPerson(string ssn)
        {
            string endpointUrl = $"parties/lookup";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var accessToken = await _accessTokenProvider.GetAccessToken();

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(new PartyLookup { Ssn = ssn }, _serializerOptions), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody, accessToken);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<Party>(response, _logger, "RegisterClient // GetPartyForPerson");
        }

        /// <inheritdoc/>
        public async Task<List<Party>> GetPartyList(List<Guid> uuidList)
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

        /// <inheritdoc/>
        public async Task<PartyR> GetParty(Guid uuid)
        {
            try
            {
                string endpointUrl = $"access-management/parties/{uuid}?fields=party,person.date-of-birth,org.type";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);
                string responseContent = await response.Content.ReadAsStringAsync();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return JsonSerializer.Deserialize<PartyR>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // RegisterClient // GetPartyByUuid // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RegisterClient // GetPartyForOrganization // Exception");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<Person> GetPerson(string ssn, string lastname)
        {
            string endpointUrl = $"persons";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            var platformAccessToken = await _accessTokenProvider.GetAccessToken();

            var request = new HttpRequestMessage(HttpMethod.Get, endpointUrl);
            request.Headers.Add("X-Ai-NationalIdentityNumber", ssn);
            request.Headers.Add("X-Ai-LastName", lastname);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Add("PlatformAccessToken", platformAccessToken);

            HttpResponseMessage response = await _client.SendAsync(request);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<Person>(response);
        }

        /// <inheritdoc/>
        public async Task<List<PartyName>> GetPartyNames(IEnumerable<string> orgNumbers, CancellationToken cancellationToken)
        {
            try
            {
                string endpointUrl = $"parties/nameslookup";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext!, _platformSettings.JwtCookieName!);
                var accessToken = await _accessTokenProvider.GetAccessToken();

                PartyNamesLookup lookupNames = new()
                {
                    Parties = orgNumbers.Where(x => x.Length == 9).Select(x => new PartyLookup() { OrgNo = x }).ToList()
                };
                StringContent requestContent = new(JsonSerializer.Serialize(lookupNames, _serializerOptions), Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestContent, accessToken);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<PartyNamesLookupResult>(responseContent, _serializerOptions)?.PartyNames;
                }

                _logger.LogError("AccessManagement.UI // RegisterClient // GetPartyNames // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RegisterClient // GetPartyNames // Exception");
                throw;
            }
        }
    }
}
