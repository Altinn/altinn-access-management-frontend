using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

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
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

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
        public async Task<RoleMetadata> GetRoleById(Guid roleId, string languageCode)
        {
            string endpointUrl = $"meta/info/roles/{roleId}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            if (response.IsSuccessStatusCode)
            {
                string content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<RoleMetadata>(content, _serializerOptions);
            }

            _logger.LogError("Get role metadata from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException(
                "StatusError",
                "Unexpected response status from Access Management",
                response.StatusCode,
                Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AccessPackage>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode)
        {
            string endpointUrl =
                $"meta/info/roles/packages?role={Uri.EscapeDataString(roleCode ?? string.Empty)}&variant={Uri.EscapeDataString(variant ?? string.Empty)}&includeResources={includeResources}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<AccessPackage>>(response, _logger, "RoleClient // GetRolePackages");
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ResourceAM>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode)
        {
            string endpointUrl =
                $"meta/info/roles/resources?role={Uri.EscapeDataString(roleCode ?? string.Empty)}&variant={Uri.EscapeDataString(variant ?? string.Empty)}&includePackageResources={includePackageResources}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<ResourceAM>>(response, _logger, "RoleClient // GetRoleResources");
        }
    }
}
