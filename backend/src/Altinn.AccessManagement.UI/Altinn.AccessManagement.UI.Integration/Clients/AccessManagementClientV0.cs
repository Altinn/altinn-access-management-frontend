using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Integration.Clients
{
    /// <summary>
    ///     Client that integrates with MaskinportenSchema API
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class AccessManagementClientV0 : IAccessManagementClientV0
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
        public AccessManagementClientV0(
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
        public async Task<AuthorizedParty> GetPartyFromReporteeListIfExists(Guid partyUuid)
        {
            try
            {
                string endpointUrl = $"enduser/authorizedparties?partyFilter={partyUuid}&includeSubParties=true&includeInactiveParties=true";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<PaginatedResult<AuthorizedParty>>(responseContent, _serializerOptions);
                    var returnedParty = result?.Items?.FirstOrDefault();
                    if (returnedParty != null && returnedParty.PartyUuid == partyUuid)
                    {
                        return returnedParty;
                    }
                    else if (returnedParty != null)
                    {
                        return returnedParty.Subunits?.FirstOrDefault(subunit => subunit.PartyUuid == partyUuid);
                    }

                    return null;
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
        public async Task<List<AuthorizedParty>> GetReporteeListForUser()
        {
            try
            {
                string endpointUrl = $"enduser/authorizedparties?includeSubParties=true&includeInactiveParties=true";
                string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

                HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<PaginatedResult<AuthorizedParty>>(responseContent, _serializerOptions);
                    return result?.Items?.ToList() ?? new List<AuthorizedParty>();
                }

                _logger.LogError("GetReporteeListForUser from accessmanagement failed with {StatusCode}", response.StatusCode);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AccessManagement.UI // AccessManagementClient // GetReporteeListForUser // Exception");
                throw;
            }
        }
    }
}
