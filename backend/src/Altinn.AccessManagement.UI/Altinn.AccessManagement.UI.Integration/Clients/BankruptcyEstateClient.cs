using System.Net;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// implements <see cref="IBankruptcyEstateClient"/> to provide operations against the bankruptcy estate endpoints in Access Management.
    /// </summary>
    public class BankruptcyEstateClient : IBankruptcyEstateClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BankruptcyEstateClient> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;

        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        private const string JsonMediaType = "application/json";
        private const string StatusErrorTitle = "StatusError";
        private const string StatusErrorMessage = "Unexpected response status from Access Management";

        /// <summary>
        /// Initializes a new instance of the <c>BankruptcyEstateClient</c> class with the specified <see
        /// cref="HttpClient"/>.
        /// </summary>
        /// <remarks>The <see cref="HttpClient"/> instance is provided by the caller and is expected to be
        /// managed externally.</remarks>
        /// <param name="httpClient">The <see cref="HttpClient"/> used to send HTTP requests.</param>
        /// <param name="logger">The <see cref="ILogger{TCategoryName}"/> used for logging.</param>
        /// <param name="httpContextAccessor">The <see cref="IHttpContextAccessor"/> used to access the current HTTP context.</param>
        /// <param name="platformSettings">The <see cref="PlatformSettings"/> containing configuration settings for the platform.</param>
        public BankruptcyEstateClient(
            HttpClient httpClient,
            ILogger<BankruptcyEstateClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint + "v1/");
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc/>
        public async Task<bool> HasAnyEstates(Guid partyId, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/bankruptcyestate/estates/any?party={partyId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            var httpResponse = await _httpClient.GetAsync(token, endpointUrl, cancellationToken);
            if (httpResponse.StatusCode == HttpStatusCode.Forbidden)
            {
                return false;
            }

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<bool>(httpResponse, _logger, "BankruptcyEstateClient.HasAnyEstates");
        }

        /// <inheritdoc />
        public async Task<IEnumerable<BankruptcyEstateAdministrator>> GetAdministrators(Guid partyId, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/bankruptcyestate/administrators?party={partyId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _httpClient.GetAsync(token, endpointUrl, cancellationToken);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("AccessManagement.UI // BankruptcyEstateClient.GetAdministrators // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
                throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
            }

            PaginatedResult<BankruptcyEstateAdministrator> administrators = JsonSerializer.Deserialize<PaginatedResult<BankruptcyEstateAdministrator>>(responseContent, _serializerOptions);
            return administrators?.Items ?? Enumerable.Empty<BankruptcyEstateAdministrator>();
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAdministrator(Guid partyId, PersonInput personInput, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/bankruptcyestate/administrators?party={partyId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(personInput, _serializerOptions), Encoding.UTF8, JsonMediaType);

            HttpResponseMessage response = await _httpClient.PostAsync(token, endpointUrl, requestBody, cancellationToken);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("AccessManagement.UI // BankruptcyEstateClient.AddAdministrator // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
                throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
            }

            return JsonSerializer.Deserialize<AssignmentDto>(responseContent, _serializerOptions);
        }

        /// <inheritdoc />
        public async Task RemoveAdministrator(Guid partyId, Guid user, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/bankruptcyestate/administrators?party={partyId}&user={user}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _httpClient.DeleteAsync(token, endpointUrl, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("AccessManagement.UI // BankruptcyEstateClient.RemoveAdministrator // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }
    }
}
