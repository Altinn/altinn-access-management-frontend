using System.Collections.Generic;
using System.Linq;
using System.Net;
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
    /// Client for interacting with the v1 client delegation endpoints.
    /// Legacy implementation; delete together with <see cref="ClientDelegationClientResolver"/> when v1 is retired.
    /// </summary>
    public class ClientDelegationClientV1 : IClientDelegationClient
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
        /// Initializes a new instance of the <see cref="ClientDelegationClientV1"/> class.
        /// </summary>
        /// <param name="httpClient">The http client.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="httpContextAccessor">The http context accessor.</param>
        /// <param name="platformSettings">Platform settings configuration.</param>
        public ClientDelegationClientV1(
            HttpClient httpClient,
            ILogger<ClientDelegationClientV1> logger,
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
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<MyClientDelegation>>(response, _logger, "ClientDelegationClientV1.GetMyClients");

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
            _logger.LogError("AccessManagement.UI // ClientDelegationClientV1.RemoveMyClientProvider // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        public async Task RemoveMyClientAccessPackages(Guid provider, Guid from, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/my/clients?provider={provider}&from={from}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            _logger.LogError("AccessManagement.UI // ClientDelegationClientV1.RemoveMyClientAccessPackages // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
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
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ClientDelegation>>(response, _logger, "ClientDelegationClientV1.GetClients");

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
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<AgentDelegation>>(response, _logger, "ClientDelegationClientV1.GetAgents");

            if (agents?.Items == null)
            {
                return Enumerable.Empty<AgentDelegation>();
            }

            return agents.Items;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ClientDelegation>> GetAgentAccessPackages(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/accesspackages?party={party}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<ClientDelegation> clients =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<ClientDelegation>>(response, _logger, "ClientDelegationClientV1.GetAgentAccessPackages");

            if (clients?.Items == null)
            {
                return Enumerable.Empty<ClientDelegation>();
            }

            return clients.Items;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AgentDelegation>> GetClientAccessPackages(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/clients/accesspackages?party={party}&from={from}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.GetAsync(token, endpointUrl);
            PaginatedResult<AgentDelegation> agents =
                await ClientUtils.DeserializeIfSuccessfullStatusCode<PaginatedResult<AgentDelegation>>(response, _logger, "ClientDelegationClientV1.GetClientAccessPackages");

            if (agents?.Items == null)
            {
                return Enumerable.Empty<AgentDelegation>();
            }

            return agents.Items;
        }

        /// <inheritdoc />
        public async Task<List<DelegationDto>> AddAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.PostAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("AccessManagement.UI // ClientDelegationClientV1.AddAgentAccessPackages // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
                throw new HttpStatusException(UnexpectedHttpResponseMessage, UnexpectedHttpResponseMessage, response.StatusCode, null, response.ReasonPhrase);
            }

            List<DelegationDto> result = JsonSerializer.Deserialize<List<DelegationDto>>(responseContent, _serializerOptions);
            return result ?? new List<DelegationDto>();
        }

        /// <inheritdoc />
        public async Task RemoveAgentAccessPackages(Guid party, Guid from, Guid to, DelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            StringContent requestBody = new StringContent(JsonSerializer.Serialize(payload, _serializerOptions), Encoding.UTF8, JsonMediaType);
            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl, requestBody);
            string responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            _logger.LogError("AccessManagement.UI // ClientDelegationClientV1.RemoveAgentAccessPackages // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddAgent(Guid party, Guid? to, PersonInput personInput = null, CancellationToken cancellationToken = default)
        {
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}" + (to != null ? $"&to={to}" : string.Empty);
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
            string endpointUrl = $"enduser/clientdelegations/agents?party={party}&to={to}&cascade=true";
            string token = JwtTokenUtil.GetTokenFromContext(_httpContextAccessor.HttpContext, _platformSettings.JwtCookieName);

            HttpResponseMessage response = await _client.DeleteAsync(token, endpointUrl);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            string responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("AccessManagement.UI // ClientDelegationClientV1.RemoveAgent // Unexpected HttpStatusCode: {StatusCode}\n {ResponseBody}", response.StatusCode, responseContent);
            throw new HttpStatusException(StatusErrorTitle, StatusErrorMessage, response.StatusCode, _httpContextAccessor.HttpContext?.TraceIdentifier, responseContent);
        }

        /// <inheritdoc />
        /// <remarks>Single rights delegation arrived with v2, so a v1 client never has any.</remarks>
        public Task<IEnumerable<ClientDelegation>> GetAgentResources(Guid party, Guid to, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Enumerable.Empty<ClientDelegation>());
        }

        /// <inheritdoc />
        /// <remarks>Single rights delegation arrived with v2, so a v1 client never has any.</remarks>
        public Task<IEnumerable<AgentDelegation>> GetClientResources(Guid party, Guid from, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Enumerable.Empty<AgentDelegation>());
        }

        /// <inheritdoc />
        public Task<List<ResourceDelegationDto>> AddAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            throw NotAvailableInV1();
        }

        /// <inheritdoc />
        public Task RemoveAgentResources(Guid party, Guid from, Guid to, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            throw NotAvailableInV1();
        }

        /// <inheritdoc />
        public Task RemoveMyClientResources(Guid provider, Guid from, ResourceDelegationBatchInputDto payload, CancellationToken cancellationToken = default)
        {
            throw NotAvailableInV1();
        }

        /// <summary>
        /// Delegating single rights requires the v2 endpoints. Surfaced as 501 rather than a server
        /// error so the caller can tell "not available in this configuration" from "something broke".
        /// </summary>
        private HttpStatusException NotAvailableInV1()
        {
            _logger.LogWarning("AccessManagement.UI // ClientDelegationClientV1 // Single rights delegation attempted while the v2 client delegation API is disabled");
            return new HttpStatusException(
                "NotAvailable",
                "Single rights delegation requires the v2 client delegation API",
                HttpStatusCode.NotImplemented,
                _httpContextAccessor.HttpContext?.TraceIdentifier);
        }
    }
}
