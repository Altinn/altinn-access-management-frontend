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
    /// Client for interacting with the v2 client delegation endpoints.
    /// Compared to v1, the client and agent query parameters are named client/agent instead of
    /// from/to, and batch deletes are performed with POST to dedicated /delete routes.
    /// The single rights resource endpoints of <see cref="IClientDelegationResourceClient"/> only
    /// exist in v2, so they have no v1 counterpart and are not routed through the selector.
    /// </summary>
    public class ClientDelegationClientV2 : IClientDelegationClient, IClientDelegationResourceClient
    {
        private readonly ILogger _logger;
        private readonly HttpClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly PlatformSettings _platformSettings;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        private const string JsonMediaType = "application/json";
        private const string StatusErrorTitle = "StatusError";
        private const string StatusErrorMessage = "Unexpected response status from Access Management";
        private const string UnexpectedHttpResponseMessage = "Unexpected http response.";

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientDelegationClientV2"/> class.
        /// </summary>
        /// <param name="httpClient">The http client.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="httpContextAccessor">The http context accessor.</param>
        /// <param name="platformSettings">Platform settings configuration.</param>
        public ClientDelegationClientV2(
            HttpClient httpClient,
            ILogger<ClientDelegationClientV2> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<PlatformSettings> platformSettings)
        {
            _logger = logger;
            _platformSettings = platformSettings.Value;
            httpClient.BaseAddress = new Uri(_platformSettings.ApiAccessManagementEndpoint + "v2/");
            httpClient.DefaultRequestHeaders.Add(_platformSettings.SubscriptionKeyHeaderName, _platformSettings.SubscriptionKey);
            _client = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MyClientDelegation>> GetMyClients(List<Guid> provider = null, CancellationToken cancellationToken = default)
        {
            string endpointUrl = "enduser/clientdelegations/my/clients";
            if (provider?.Count > 0)
            {
                string providerQuery = string.Join("&", provider.Select(providerId => $"provider={providerId}"));
                endpointUrl = $"{endpointUrl}?{providerQuery}";
            }

            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<MyClientDelegation> clients =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<MyClientDelegation>>(response, _logger, "ClientDelegationClientV2.GetMyClients");

            if (clients?.Items == null)
            {
                return Enumerable.Empty<MyClientDelegation>();
            }

            return clients.Items;
        }

        /// <inheritdoc />
        public async Task RemoveMyClientProvider(Guid provider, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/my/clientproviders?provider={provider}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            string responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("AccessManagement.UI // ClientDelegationClientV2.RemoveMyClientProvider // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        public async Task RemoveMyClientAccessPackages(Guid provider, Guid from, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/my/clients/accesspackages/delete?provider={provider}&client={from}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            _logger.LogError("AccessManagement.UI // ClientDelegationClientV2.RemoveMyClientAccessPackages // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetClients(Guid party, List<string> roles = null, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/clients?party={party}";
            if (roles?.Count > 0)
            {
                string roleQuery = string.Join("&", roles
                    .Where(role => !string.IsNullOrWhiteSpace(role))
                    .Select(role => $"roles={Uri.EscapeDataString(role)}"));

                if (!string.IsNullOrEmpty(roleQuery))
                {
                    endpointUrl = $"{endpointUrl}&{roleQuery}";
                }
            }

            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<ClientDelegation> clients =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ClientDelegation>>(response, _logger, "ClientDelegationClientV2.GetClients");

            if (clients?.Items == null)
            {
                return Enumerable.Empty<ClientDelegation>();
            }

            return clients.Items;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetAgents(Guid party, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<AgentDelegation> agents =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<AgentDelegation>>(response, _logger, "ClientDelegationClientV2.GetAgents");

            if (agents?.Items == null)
            {
                return Enumerable.Empty<AgentDelegation>();
            }

            return agents.Items;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentAccessPackages(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/accesspackages?party={party}&agent={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<ClientDelegation> clients =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ClientDelegation>>(response, _logger, "ClientDelegationClientV2.GetAgentAccessPackages");

            if (clients?.Items == null)
            {
                return Enumerable.Empty<ClientDelegation>();
            }

            return clients.Items;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientAccessPackages(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/clients/accesspackages?party={party}&client={from}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<AgentDelegation> agents =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<AgentDelegation>>(response, _logger, "ClientDelegationClientV2.GetClientAccessPackages");

            if (agents?.Items == null)
            {
                return Enumerable.Empty<AgentDelegation>();
            }

            return agents.Items;
        }

        /// <inheritdoc />
        public async Task<List<DelegationDto>> AddAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/accesspackages?party={party}&client={from}&agent={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("AccessManagement.UI // ClientDelegationClientV2.AddAgentAccessPackages // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
                throw new HttpStatusException(UnexpectedHttpResponseMessage, UnexpectedHttpResponseMessage, response.StatusCode, null, response.ReasonPhrase);
            }

            List<DelegationDto> result = JsonSerializer.Deserialize<List<DelegationDto>>(responseContent, _serializerOptions);
            return result ?? new List<DelegationDto>();
        }

        /// <inheritdoc />
        public async Task RemoveAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/accesspackages/delete?party={party}&client={from}&agent={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            _logger.LogError("AccessManagement.UI // ClientDelegationClientV2.RemoveAgentAccessPackages // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}" + (to != null ? $"&agent={to}" : string.Empty);
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = personInput != null ? new StringContent(JsonSerializer.Serialize(personInput, _serializerOptions), Encoding.UTF8, JsonMediaType) : null;

            var httpResponse = await _client.PostAsync(token, endpointUrl, requestBody);

            var content = await httpResponse.Content.ReadAsStringAsync();

            if (!httpResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Unexpected http response. Status code: {StatusCode}, Reason: {ReasonPhrase}", httpResponse.StatusCode, httpResponse.ReasonPhrase);
                throw new HttpStatusException(UnexpectedHttpResponseMessage, UnexpectedHttpResponseMessage, httpResponse.StatusCode, null, httpResponse.ReasonPhrase);
            }

            AssignmentDto response = JsonSerializer.Deserialize<AssignmentDto>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return response;
        }

        /// <inheritdoc />
        public async Task RemoveAgent(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}&agent={to}&cascade=true";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            string responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("AccessManagement.UI // ClientDelegationClientV2.RemoveAgent // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentResources(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/resources?party={party}&agent={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<ClientDelegation> clients =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ClientDelegation>>(response, _logger, "ClientDelegationClientV2.GetAgentResources");

            if (clients?.Items == null)
            {
                return Enumerable.Empty<ClientDelegation>();
            }

            return clients.Items;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientResources(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/clients/resources?party={party}&client={from}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<AgentDelegation> agents =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<AgentDelegation>>(response, _logger, "ClientDelegationClientV2.GetClientResources");

            if (agents?.Items == null)
            {
                return Enumerable.Empty<AgentDelegation>();
            }

            return agents.Items;
        }

        /// <inheritdoc />
        public async Task<List<ResourceDelegationDto>> AddAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/resources?party={party}&client={from}&agent={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("AccessManagement.UI // ClientDelegationClientV2.AddAgentResources // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
                throw new HttpStatusException(UnexpectedHttpResponseMessage, UnexpectedHttpResponseMessage, response.StatusCode, null, response.ReasonPhrase);
            }

            List<ResourceDelegationDto> result = JsonSerializer.Deserialize<List<ResourceDelegationDto>>(responseContent, _serializerOptions);
            return result ?? new List<ResourceDelegationDto>();
        }

        /// <inheritdoc />
        public async Task RemoveAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/resources/delete?party={party}&client={from}&agent={to}";
            await PostResourceDelete(endpointUrl, payload, "RemoveAgentResources", cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveMyClientResources(Guid provider, Guid from, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/my/clients/resources/delete?provider={provider}&client={from}";
            await PostResourceDelete(endpointUrl, payload, "RemoveMyClientResources", cancellationToken);
        }

        private async Task PostResourceDelete(string endpointUrl, ResourceDelegationBatchInputDto payload, string operation, CancellationToken cancellationToken)
        {
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            _logger.LogError("AccessManagement.UI // ClientDelegationClientV2.{Operation} // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", operation, response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }
    }
}
