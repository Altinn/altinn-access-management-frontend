using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Extensions;
using Altinn.AccessManagement.UI.Core.Helpers;
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
    /// Client for interacting with client delegation endpoints.
    /// </summary>
    public class ClientDelegationClient : IClientDelegationClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientDelegationClient"/> class.
        /// </summary>
        /// <param name="httpClient">The http client.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="httpContextAccessor">The http context accessor.</param>
        /// <param name="platformSettings">Platform settings configuration.</param>
        public ClientDelegationClient(
            HttpClient httpClient,
            ILogger<ClientDelegationClient> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint);
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public async Task<List<ClientDelegation>> GetClients(Guid party, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/clients?party={party}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<ClientDelegation> clients =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ClientDelegation>>(response, _logger, "ClientDelegationClient.GetClients");

            if (clients?.Items == null)
            {
                return new List<ClientDelegation>();
            }

            return clients.Items.ToList();
        }

        /// <inheritdoc />
        public async Task<List<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<AgentDelegation> agents =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<AgentDelegation>>(response, _logger, "ClientDelegationClient.GetAgents");

            if (agents?.Items == null)
            {
                return new List<AgentDelegation>();
            }

            return agents.Items.ToList();
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}" + (to != null ? $"&to={to}" : string.Empty);
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = personInput != null ? new StringContent(JsonSerializer.Serialize(personInput, _serializerOptions), Encoding.UTF8, "application/json") : null;

            var httpResponse = await _client.PostAsync(token, endpointUrl, requestBody);

            var content = await httpResponse.Content.ReadAsStringAsync();

            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError($"Unexpected http response. Status code: {httpResponse.StatusCode}, Reason: {httpResponse.ReasonPhrase}");
                throw new HttpStatusException("Unexpected http response.", "Unexpected http response.", httpResponse.StatusCode, null, httpResponse.ReasonPhrase);
            }

            AssignmentDto response = JsonSerializer.Deserialize<AssignmentDto>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return response;
        }

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            string responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("AccessManagement.UI // ClientDelegationClient.RemoveAgent // Unexpected HttpStatusCode: {StatusCode}\n {responseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException("StatusError", "Unexpected response status from Access Management", response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> GetDelegatedAccessPackagesToAgentsViaParty(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/accesspackages?party={party}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            return await _client.GetAsync(token, endpointUrl);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> GetDelegatedAccessPackagesFromClientsViaParty(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/clients/accesspackages?party={party}&from={from}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            return await _client.GetAsync(token, endpointUrl);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> AddAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default)
        {
            string endpointUrl = BuildAgentAccessPackageUrl(party, from, to, packageId, package);
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            return await _client.PostAsync(token, endpointUrl, null);
        }

        /// <inheritdoc />
        public async Task<HttpResponseMessage> DeleteAgentAccessPackage(Guid party, Guid from, Guid to, Guid? packageId, string package, CancellationToken cancellationToken = default)
        {
            string endpointUrl = BuildAgentAccessPackageUrl(party, from, to, packageId, package);
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            return await _client.DeleteAsync(token, endpointUrl);
        }

        private static string BuildAgentAccessPackageUrl(Guid party, Guid from, Guid to, Guid? packageId, string package)
        {
            var endpointBuilder = new StringBuilder($"enduser/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}");

            if (packageId.HasValue)
            {
                endpointBuilder.Append($"&packageId={packageId}");
            }

            if (!string.IsNullOrWhiteSpace(package))
            {
                endpointBuilder.Append($"&package={Uri.EscapeDataString(package)}");
            }

            return endpointBuilder.ToString();
        }
    }
}
