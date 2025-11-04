using System.Diagnostics;
using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for fetching and interacting with Roles
    /// </summary>
    public class RoleClient : IRoleClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly IAccessTokenProvider _accessTokenProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessPackageClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        /// <param name="accessTokenProvider">the handler for access token generator</param>
        public RoleClient(
            HttpClient httpClient,
            ILogger<RoleClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _accessTokenProvider = accessTokenProvider;
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<RolePermission>> GetRoleConnections(Guid party, Guid? from, Guid? to, string languageCode)
        {
            string endpointUrl = $"enduser/connections/roles?party={party}&from={from}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<RolePermission>>(response, _logger, "RoleClient // GetRoleConnections");
        }

        /// <inheritdoc />
        public async Task RevokeRole(Guid from, Guid to, Guid party, Guid roleId)
        {
            string endpointUrl = $"enduser/connections/roles?party={party}&to={to}&from={from}&roleId={roleId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Revoke role delegation from accessmanagement failed with {StatusCode}", response.StatusCode);
                throw new HttpStatusException(
                    "StatusError",
                    "Unexpected response status from Access Management",
                    response.StatusCode,
                    Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
            }
        }
    }
}
