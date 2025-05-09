using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.AccessManagement.UI.Integration.Util;
using Altinn.Platform.Register.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    ///     Client that integrates with MaskinportenSchema API
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class AccessManagementClient : IAccessManagementClient
    {
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly PlatformSettings _platformSettings;

        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="AccessManagementClient" /> class
        /// </summary>
        public AccessManagementClient(
            HttpClient httpClient,
            ILogger<AccessManagementClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            _httpContextAccessor = httpContextAccessor;
            _serializerOptions.Converters.Add(new JsonStringEnumConverter());
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            _client = httpClient;
        }

        /// <inheritdoc />
        public async Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId)
        {
            try
            {
                string endpointUrl = $"authorizedparty/{partyId}?includeAltinn2=true";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<AuthorizedParty>(responseContent, _serializerOptions);
                }

                _logger.LogError("GetPartyFromReporteeListIfExists from accessmanagement failed with {StatusCode}", response.StatusCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // AccessManagementClient // GetPartyFromReporteeListIfExists // Exception");
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<List<AuthorizedParty>> GetReporteeRightHolders(int partyId)
        {
            string endpointUrl = $"rightholders/{partyId}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<List<AuthorizedParty>>(responseContent, _serializerOptions);
            }

            _logger.LogError("Getting right holders from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        /// <inheritdoc />
        public async Task<List<AuthorizedParty>> GetReporteeList(Guid partyId)
        {
            string endpointUrl = $"enduser/access/parties?party={partyId}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            return await ClientUtils.DeserializeIfSuccessfullStatusCode<List<AuthorizedParty>>(response);
        }

        /// <inheritdoc />
        public async Task<UserAccesses> GetUserAccesses(Guid from, Guid to)
        {
            string endpointUrl = $"enduser/{from}/access/{to}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<UserAccesses>(responseContent, _serializerOptions);
            }

            _logger.LogError("Getting right holders from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        //// Single Rights

        /// <inheritdoc />
        public async Task<List<DelegationCheckedRight>> GetDelegationCheck(Guid party, string resource)
        {
            string endpointUrl = $"todo/resources/{resource}/rights/delegationcheck/?from={party}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<List<DelegationCheckedRight>>(response);
        }

        /// <inheritdoc />
        public async Task<DelegationOutput> DelegateResource(Guid from, Guid to, string resource, List<string> rights)
        {
            string endpointUrl = $"todo/resources/{resource}/rights?from={from}&to={to}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(rights, _serializerOptions), Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<DelegationOutput>(response);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> GetSingleRightsForRightholder(string party, string userId)
        {
            string endpointUrl = $"todo/{party}/{userId}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return response;
            }

            _logger.LogError("Getting single rights from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeResourceDelegation(Guid from, Guid to, string resourceId)
        {
            string endpointUrl = $"todo/enduser/delegations/from/{from}/to/{to}/resources/{resourceId}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);

            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            _logger.LogError("Revoke resource delegation from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeRightDelegation(Guid from, Guid to, string resourceId, string rightKey)
        {
            string endpointUrl = $"todo/enduser/delegations/from/{from}/to/{to}/resources/{resourceId}/rights/{rightKey}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);

            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            _logger.LogError("Revoke right delegation from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> DelegateResourceRights(string from, string to, string resourceId, List<string> rightKeys)
        {
            string endpointUrl = $"todo/enduser/delegations/from/{from}/to/{to}/resources/{resourceId}/rights"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            StringContent requestBody = new StringContent(JsonSerializer.Serialize(rightKeys, _serializerOptions), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);

            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            string sanitizedResourceId = resourceId.Replace(Environment.NewLine, string.Empty).Replace("\n", string.Empty).Replace("\r", string.Empty);
            _logger.LogError($"Delegation of rights to resource {sanitizedResourceId} failed in accessmanagement with status code {response.StatusCode}");
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        //// Access packages

        /// <inheritdoc />
        public async Task<List<AccessPackageAccess>> GetAccessPackageAccesses(string to, string from, string languageCode)
        {
            string endpointUrl = $"/accessmanagement/api/v1/enduser/access/accesspackages?to={to}&from={from}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<List<AccessPackageAccess>>(response);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> RevokeAccessPackage(Guid from, Guid to, string packageId)
        {
            string endpointUrl = $"todo/enduser/access/accesspackages/{packageId}?to={to}&from={from}"; // TODO: Switch with actual backend endpoint when available
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);
            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);

            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            _logger.LogError("Revoke resource delegation from accessmanagement failed with {StatusCode}", response.StatusCode);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, Activity.Current?.Id ?? _httpContextAccessor.HttpContext?.TraceIdentifier);
        }

        /// <inheritdoc />
        public Task<List<AccessPackageDelegationCheckResponse>> AccessPackageDelegationCheck(DelegationCheckRequest delegationCheckRequest)
        {
            throw new NotImplementedException();
        }

        //// Roles

        /// <inheritdoc />
        public async Task<List<Role>> GetRoleSearchMatches(string languageCode, string searchString)
        {
            string endpointUrl = $"role/search/term={searchString}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl, languageCode);

            return await ClientUtils.DeserializeIfSuccessfullStatusCode<List<Role>>(response, _logger, "AccessPackageClient // GetRoleSearchMatches");
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
