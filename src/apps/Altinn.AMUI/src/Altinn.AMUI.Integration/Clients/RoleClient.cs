using Altinn.AMUI.Core.ClientInterfaces;
using Altinn.AMUI.Core.Extensions;
using Altinn.AMUI.Core.Helpers;
using Altinn.AMUI.Core.Models.AccessPackage;
using Altinn.AMUI.Core.Models.Common;
using Altinn.AMUI.Core.Models.Role;
using Altinn.AMUI.Core.Services.Interfaces;
using Altinn.AMUI.Integration.Configuration;
using Altinn.AMUI.Integration.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RoleMetadata = Altinn.AMUI.Core.Models.Common.Role;

namespace Altinn.AMUI.Integration.Clients
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

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessPackageClient"/> class
        /// </summary>
        /// <param name="httpClient">the handler for httpclient service</param>
        /// <param name="logger">the handler for logger service</param>
        /// <param name="httpContextAccessor">the handler for httpcontextaccessor service</param>
        /// <param name="platformSettings"> platform settings configuration</param>
        public RoleClient(
            HttpClient httpClient,
            ILogger<RoleClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint + "v1/");
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<RolePermission>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/connections/roles?party={party}&from={from}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken, languageCode: languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<RolePermission>>(response, _logger, "RoleClient // GetRolePermissions");
        }

        /// <inheritdoc />
        public async Task<IEnumerable<RoleMetadata>> GetAllRoles(string languageCode, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"meta/info/roles?language={languageCode}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken, languageCode: languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<RoleMetadata>>(response, _logger, "RoleClient // GetAllRoles");
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AccessPackage>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode, CancellationToken cancellationToken = default)
        {
            string endpointUrl =
                $"meta/info/roles/packages?role={Uri.EscapeDataString(roleCode ?? string.Empty)}&variant={Uri.EscapeDataString(variant ?? string.Empty)}&includeResources={includeResources}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken, languageCode: languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<AccessPackage>>(response, _logger, "RoleClient // GetRolePackages");
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ResourceAM>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode, CancellationToken cancellationToken = default)
        {
            string endpointUrl =
                $"meta/info/roles/resources?role={Uri.EscapeDataString(roleCode ?? string.Empty)}&variant={Uri.EscapeDataString(variant ?? string.Empty)}&includePackageResources={includePackageResources}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, cancellationToken, languageCode: languageCode);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<IEnumerable<ResourceAM>>(response, _logger, "RoleClient // GetRoleResources");
        }

        /// <inheritdoc />
        public async Task RemoveRole(Guid party, Guid from, Guid to, string roleCode, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/connections/roles?party={party}&from={from}&to={to}&rolecode={Uri.EscapeDataString(roleCode ?? string.Empty)}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("AccessManagement.UI // RoleClient.RemoveRole // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }
    }
}
