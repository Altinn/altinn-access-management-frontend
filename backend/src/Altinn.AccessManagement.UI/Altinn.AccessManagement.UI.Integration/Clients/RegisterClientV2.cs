using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
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
    public class RegisterClientV2 : IRegisterClientV2
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterClientV2"/> class
        /// </summary>
        /// <param name="httpClient">http client</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public RegisterClientV2(
            HttpClient httpClient,
            ILogger<RegisterClientV2> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiRegisterV2Endpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _accessTokenProvider = accessTokenProvider;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
        }

        /// <inheritdoc />
        public async Task<CustomerList> GetPartyRegnskapsforerCustomers(Guid partyUuid, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"internal/parties/{partyUuid}/customers/ccr/regnskapsforer";
                var accessToken = await _accessTokenProvider.GetAccessToken();

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, accessToken);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<CustomerList>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // RegisterClientV2 // GetPartyRegnskapsforerCustomers // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RegisterClientV2 // GetPartyRegnskapsforerCustomers // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<CustomerList> GetPartyRevisorCustomers(Guid partyUuid, CancellationToken cancellationToken)
        {
            try
            {
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                string endpointUrl = $"internal/parties/{partyUuid}/customers/ccr/revisor";

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
                string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    return JsonSerializer.Deserialize<CustomerList>(responseContent, _serializerOptions);
                }

                _logger.LogError("AccessManagement.UI // RegisterClientV2 // GetPartyRevisorCustomers // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // RegisterClientV2 // GetPartyRevisorCustomers // Exception");
                throw;
            }
        }
    }
}