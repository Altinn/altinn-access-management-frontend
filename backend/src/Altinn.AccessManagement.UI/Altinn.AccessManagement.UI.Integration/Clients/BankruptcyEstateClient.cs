using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;


namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// implements <see cref="IBankruptcyEstateClient"/> to provide operations for determining whether a party is a bankruptcy estate administrator.
    /// </summary>
    public class BankruptcyEstateClient : IBankruptcyEstateClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BankruptcyEstateClient> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;

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

        ///Determines whether the specified party has any bankruptcy estates.
        /// <remarks>A <see cref="HttpStatusCode.Forbidden"/> response is treated as no accessible estates
        /// and returns <see langword="false"/>.</remarks>The unique identifier of the party to check.A token to cancel the asynchronous operation.<see langword="true"/> when at least one estate exists for the specified party; otherwise, <see
        /// langword="false"/>.Thrown when the HTTP response indicates a failure other than <see cref="HttpStatusCode.Forbidden"/>.
        public async Task<bool> HasAnyEstates(Guid partyId, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/bankruptcyestate/estates/any?party={partyId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            var httpResponse = await _httpClient.GetAsync(token, endpointUrl, cancellationToken);
            if (httpResponse.StatusCode == HttpStatusCode.Forbidden)
            {
                return false;
            }

            if (!httpResponse.IsSuccessStatusCode)
            {
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", httpResponse.StatusCode, null, httpResponse.ReasonPhrase);
            }
            string content = await httpResponse.Content.ReadAsStringAsync(cancellationToken);
            return JsonSerializer.Deserialize<bool>(content);
        }
    }
}
