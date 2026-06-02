using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using AltinnCore.Authentication.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for verifying legacy Altinn 2 user accounts via the Altinn Authentication platform API.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SelfIdentifiedUserClient : ISelfIdentifiedUserClient
    {
        private readonly ILogger _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly HttpClient _httpClient;
        private readonly PlatformSettings _platformSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelfIdentifiedUserClient"/> class.
        /// </summary>
        public SelfIdentifiedUserClient(
            IOptions<PlatformSettings> platformSettings,
            ILogger<SelfIdentifiedUserClient> logger,
            IHttpContextAccessor httpContextAccessor,
            HttpClient httpClient)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAuthenticationEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _httpClient = httpClient;
        }

        /// <inheritdoc />
        public async Task<Guid> ValidateCredentials(Altinn2AccountRequest request, CancellationToken cancellationToken)
        {
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            string endpointUrl = "enduser/selfidentified/validate-credentials";

            var content = JsonContent.Create(request);
            HttpResponseMessage response = await _httpClient.PostAsync(token, endpointUrl, content);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<Guid>(response, _logger, "SelfIdentifiedUserClient.ValidateCredentials");
        }
    }
}
