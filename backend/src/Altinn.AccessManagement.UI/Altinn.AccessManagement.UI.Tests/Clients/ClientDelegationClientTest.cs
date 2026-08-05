using System.Net;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.FeatureManagement;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Clients
{
    /// <summary>
    /// Tests that the v2 client delegation client builds the expected request urls
    /// (client/agent query parameters and POST /delete routes), and that
    /// <see cref="ClientDelegationClientResolver"/> resolves to v1 when the
    /// UseNewSingleRightsClientDelegation feature flag is disabled.
    /// </summary>
    public class ClientDelegationClientTest
    {
        private const string BaseUrl = "http://localhost:5117/accessmanagement/api/";

        private static readonly Guid _party = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private static readonly Guid _client = Guid.Parse("22222222-2222-2222-2222-222222222222");
        private static readonly Guid _agent = Guid.Parse("33333333-3333-3333-3333-333333333333");
        private static readonly Guid _provider = Guid.Parse("44444444-4444-4444-4444-444444444444");

        private static readonly DelegationBatchInputDto _payload = new()
        {
            Values = new List<DelegationBatchInputDto.Permission>
            {
                new() { Role = "rettighetshaver", Packages = new List<string> { "urn:altinn:accesspackage:demo" } },
            },
        };

        private static readonly ResourceDelegationBatchInputDto _resourcePayload = new()
        {
            Values = new List<ResourceDelegationBatchInputDto.Permission>
            {
                new() { Role = "rettighetshaver", Resources = new List<string> { "app_ttd_a3-app" } },
            },
        };

        /// <summary>
        /// Handler that records the outgoing request and returns a fixed response.
        /// </summary>
        private sealed class RecordingHandler : HttpMessageHandler
        {
            private readonly string _responseContent;
            private readonly HttpStatusCode _statusCode;

            public RecordingHandler(string responseContent = "{\"data\":[]}", HttpStatusCode statusCode = HttpStatusCode.OK)
            {
                _responseContent = responseContent;
                _statusCode = statusCode;
            }

            public HttpRequestMessage Request { get; private set; }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Request = request;
                return Task.FromResult(new HttpResponseMessage
                {
                    StatusCode = _statusCode,
                    Content = new StringContent(_responseContent),
                });
            }
        }

        private static IClientDelegationClient CreateClient(bool useV2, RecordingHandler handler)
        {
            PlatformSettings platformSettings = new PlatformSettings
            {
                ApiAccessManagementEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            Mock<IFeatureManager> featureManager = new Mock<IFeatureManager>();
            featureManager
                .Setup(fm => fm.IsEnabledAsync(FeatureFlags.UseNewSingleRightsClientDelegation))
                .ReturnsAsync(useV2);

            IHttpContextAccessor httpContextAccessor = new HttpContextAccessor { HttpContext = new DefaultHttpContext() };
            IOptions<PlatformSettings> options = Options.Create(platformSettings);

            ClientDelegationClientV1 v1 = new ClientDelegationClientV1(
                new HttpClient(handler),
                NullLogger<ClientDelegationClientV1>.Instance,
                httpContextAccessor,
                options);

            ClientDelegationClientV2 v2 = new ClientDelegationClientV2(
                new HttpClient(handler),
                NullLogger<ClientDelegationClientV2>.Instance,
                httpContextAccessor,
                options);

            return new ClientDelegationClientResolver(v1, v2, featureManager.Object).Resolve().Result;
        }

        private static IClientDelegationClient CreateResourceClient(RecordingHandler handler)
        {
            PlatformSettings platformSettings = new PlatformSettings
            {
                ApiAccessManagementEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            return new ClientDelegationClientV2(
                new HttpClient(handler),
                NullLogger<ClientDelegationClientV2>.Instance,
                new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
                Options.Create(platformSettings));
        }

        [Fact]
        public async Task FlagDisabled_RoutesToV1()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: false, handler).GetMyClients(new List<Guid> { _provider });

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v1/enduser/clientdelegations/my/clients?provider={_provider}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetMyClients_V2Url()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).GetMyClients(new List<Guid> { _provider });

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/my/clients?provider={_provider}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task RemoveMyClientProvider_V2Url()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).RemoveMyClientProvider(_provider);

            Assert.Equal(HttpMethod.Delete, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/my/clientproviders?provider={_provider}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task RemoveMyClientAccessPackages_V2PostsToDeleteRoute()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).RemoveMyClientAccessPackages(_provider, _client, _payload);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/my/clients/accesspackages/delete?provider={_provider}&client={_client}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetClients_V2Url()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).GetClients(_party, new List<string> { "DAGL" });

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/clients?party={_party}&roles=DAGL", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetAgents_V2Url()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).GetAgents(_party);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents?party={_party}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetAgentAccessPackages_V2UsesAgentParam()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).GetAgentAccessPackages(_party, _agent);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents/accesspackages?party={_party}&agent={_agent}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetClientAccessPackages_V2UsesClientParam()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).GetClientAccessPackages(_party, _client);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/clients/accesspackages?party={_party}&client={_client}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task AddAgentAccessPackages_V2UsesClientAndAgentParams()
        {
            RecordingHandler handler = new RecordingHandler("[]");

            await CreateClient(useV2: true, handler).AddAgentAccessPackages(_party, _client, _agent, _payload);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents/accesspackages?party={_party}&client={_client}&agent={_agent}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task RemoveAgentAccessPackages_V2PostsToDeleteRoute()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).RemoveAgentAccessPackages(_party, _client, _agent, _payload);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents/accesspackages/delete?party={_party}&client={_client}&agent={_agent}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task AddAgent_V2UsesAgentParam()
        {
            RecordingHandler handler = new RecordingHandler("{}");

            await CreateClient(useV2: true, handler).AddAgent(_party, _agent);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents?party={_party}&agent={_agent}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task RemoveAgent_V2UsesAgentParam()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2: true, handler).RemoveAgent(_party, _agent);

            Assert.Equal(HttpMethod.Delete, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents?party={_party}&agent={_agent}&cascade=true", handler.Request.RequestUri.ToString());
        }

        /// <summary>
        /// The single rights resources v2 adds are only reachable if they survive deserialization
        /// into <see cref="ClientDelegation.RoleAccessPackages.Resources"/>.
        /// </summary>
        [Fact]
        public async Task GetClients_V2DeserializesResources()
        {
            string responseContent = $$"""
                {
                  "data": [
                    {
                      "client": { "id": "{{_client}}", "name": "ACME AS" },
                      "access": [
                        {
                          "role": { "id": "{{_party}}", "code": "DAGL" },
                          "packages": [ { "id": "{{_agent}}", "urn": "urn:altinn:accesspackage:demo" } ],
                          "resources": [ { "id": "{{_provider}}", "refId": "app_ttd_a3-app" } ]
                        }
                      ]
                    }
                  ]
                }
                """;

            RecordingHandler handler = new RecordingHandler(responseContent);

            IEnumerable<ClientDelegation> clients = await CreateClient(useV2: true, handler).GetClients(_party);

            CompactResource resource = Assert.Single(Assert.Single(Assert.Single(clients).Access).Resources);
            Assert.Equal(_provider, resource.Id);
            Assert.Equal("app_ttd_a3-app", resource.RefId);
        }

        /// <summary>
        /// Every v2 method throws <see cref="HttpStatusException"/> on a non-success response.
        /// </summary>
        [Fact]
        public async Task RemoveMyClientProvider_V2ThrowsOnErrorResponse()
        {
            RecordingHandler handler = new RecordingHandler("upstream is down", HttpStatusCode.InternalServerError);

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(useV2: true, handler).RemoveMyClientProvider(_provider));

            Assert.Equal(HttpStatusCode.InternalServerError, exception.StatusCode);
        }

        [Fact]
        public async Task GetAgentResources_V2Url()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateResourceClient(handler).GetAgentResources(_party, _agent);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents/resources?party={_party}&agent={_agent}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetClientResources_V2Url()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateResourceClient(handler).GetClientResources(_party, _client);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/clients/resources?party={_party}&client={_client}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task AddAgentResources_V2UsesClientAndAgentParams()
        {
            RecordingHandler handler = new RecordingHandler("[]");

            await CreateResourceClient(handler).AddAgentResources(_party, _client, _agent, _resourcePayload);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents/resources?party={_party}&client={_client}&agent={_agent}", handler.Request.RequestUri.ToString());
        }

        /// <summary>
        /// The delegation payload carries resource registry ids, not the internal guids.
        /// </summary>
        [Fact]
        public async Task AddAgentResources_V2SendsRefIdsInBody()
        {
            RecordingHandler handler = new RecordingHandler("[]");

            await CreateResourceClient(handler).AddAgentResources(_party, _client, _agent, _resourcePayload);

            string body = await handler.Request.Content.ReadAsStringAsync();
            Assert.Contains("\"resources\":[\"app_ttd_a3-app\"]", body);
            Assert.Contains("\"role\":\"rettighetshaver\"", body);
        }

        [Fact]
        public async Task RemoveAgentResources_V2PostsToDeleteRoute()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateResourceClient(handler).RemoveAgentResources(_party, _client, _agent, _resourcePayload);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents/resources/delete?party={_party}&client={_client}&agent={_agent}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task RemoveMyClientResources_V2PostsToDeleteRoute()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateResourceClient(handler).RemoveMyClientResources(_provider, _client, _resourcePayload);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/my/clients/resources/delete?provider={_provider}&client={_client}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetAgentResources_V2ThrowsOnErrorResponse()
        {
            RecordingHandler handler = new RecordingHandler("upstream is down", HttpStatusCode.InternalServerError);

            await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateResourceClient(handler).GetAgentResources(_party, _agent));
        }
        /// <summary>
        /// Single rights delegation arrived with v2. With the flag off the caller must see an empty
        /// list rather than v2 data, so the flag governs the whole surface and not just the shared
        /// operations.
        /// </summary>
        [Fact]
        public async Task GetAgentResources_FlagDisabled_ReturnsEmptyWithoutCallingV2()
        {
            RecordingHandler handler = new RecordingHandler();

            IEnumerable<ClientDelegation> clients = await CreateClient(useV2: false, handler).GetAgentResources(_party, _agent);

            Assert.Empty(clients);
            Assert.Null(handler.Request);
        }

        /// <summary>
        /// Delegating a resource with the flag off is a configuration problem, not a server error —
        /// it surfaces as 501 so the caller can tell the two apart.
        /// </summary>
        [Fact]
        public async Task AddAgentResources_FlagDisabled_ThrowsNotImplemented()
        {
            RecordingHandler handler = new RecordingHandler();

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(useV2: false, handler).AddAgentResources(_party, _client, _agent, _resourcePayload));

            Assert.Equal(HttpStatusCode.NotImplemented, exception.StatusCode);
            Assert.Null(handler.Request);
        }
    }
}
