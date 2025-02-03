using System.Net;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    /// Client for interacting with Access packages
    /// </summary>
    public class AccessPackageClient : IAccessPackageClient
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
        public AccessPackageClient(
            HttpClient httpClient,
            ILogger<AccessPackageClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings,
            IAccessTokenProvider accessTokenProvider)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessPackageEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _accessTokenProvider = accessTokenProvider;
        }
        
        /// <inheritdoc />
        public async Task<List<AccessPackage>> GetAccessPackageSearchMatches(string languageCode, string searchString)
        {
            string endpointUrl = $"package/search/term={searchString}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<List<AccessPackage>>(responseContent, _serializerOptions);
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(responseContent, _serializerOptions);

                throw error;
            }
        }

        /// <inheritdoc />
        public async Task<List<Role>> GetRoleSearchMatches(string languageCode, string searchString)
        {
            string endpointUrl = $"role/search/term={searchString}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<List<Role>>(responseContent, _serializerOptions);
            }
            else
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                HttpStatusException error = JsonSerializer.Deserialize<HttpStatusException>(responseContent, _serializerOptions);

                throw error;
            }
        }

        /// <inheritdoc />
        public async Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid)
        {
            try
            {
                var endpointUrl = $"/assignment?from={rightOwnerUuid}&to={rightHolderUuid}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);
                string responseContent = await response.Content.ReadAsStringAsync();
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return JsonSerializer.Deserialize<List<RoleAssignment>>(responseContent, _serializerOptions);
                }
                else
                {
                    _logger.LogError("AccessManagement.UI // RoleClient // GetRolesForUser // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
                    return null;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "AccessManagement.UI // RoleClient // GetRolesForUser // Exception");
                return null;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> CreateRoleDelegation(Guid from, Guid to, Guid roleId)
        {
             try
            {
                var roleAssignment = new RoleAssignment
                {
                    RoleId = roleId,
                    FromId = from,
                    ToId = to
                };
                StringContent requestBody = new StringContent(JsonSerializer.Serialize(roleAssignment, _serializerOptions), Encoding.UTF8, "application/json");
                var endpointUrl = $"/assignment";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                               
                HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return response;
                }
                else
                {
                    _logger.LogError("AccessManagement.UI // RegisterClient // GetPartyForOrganization // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, response);
                    return null;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "AccessManagement.UI // RoleClient // GetRolesForUser // Exception");
                return null;
            }
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> DeleteRoleDelegation(Guid assignmentId)
        {
             try
            {
                var endpointUrl = $"/assignment{assignmentId}";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
                               
                HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    return response;
                }
                else
                {
                    _logger.LogError("AccessManagement.UI // RegisterClient // GetPartyForOrganization // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, response);
                    return null;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "AccessManagement.UI // RoleClient // GetRolesForUser // Exception");
                return null;
            }
        }

        /// <inheritdoc />
        public Task<DelegationCheckResponse> RoleDelegationCheck(Guid rightOwner, Guid roleId)
        {
            // TODO: Implement this method when the API is ready
            throw new NotImplementedException();
        }
    }
}
