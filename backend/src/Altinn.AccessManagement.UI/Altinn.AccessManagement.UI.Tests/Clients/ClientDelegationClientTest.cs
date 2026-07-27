using System.Net;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
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
    /// Tests that <see cref="ClientDelegationClientSelector"/> routes to
    /// <see cref="ClientDelegationClientV1"/> when the UseNewSingleRightsClientDelegation feature flag
    /// is disabled and to <see cref="ClientDelegationClientV2"/> when it is enabled, and that the
    /// clients build the expected request urls.
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

        /// <summary>
        /// Handler that records the outgoing request and returns a fixed response.
        /// </summary>
        private sealed class RecordingHandler : HttpMessageHandler
        {
            private readonly string _responseContent;

            public RecordingHandler(string responseContent = "{\"items\":[]}")
            {
                _responseContent = responseContent;
            }

            public HttpRequestMessage Request { get; private set; }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Request = request;
                return Task.FromResult(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
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

            return new ClientDelegationClientSelector(v1, v2, featureManager.Object);
        }

        [Theory]
        [InlineData(false, "v1")]
        [InlineData(true, "v2")]
        public async Task GetMyClients_BuildsVersionedUrl(bool useV2, string version)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).GetMyClients(new List<Guid> { _provider });

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/my/clients?provider={_provider}", handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false, "v1")]
        [InlineData(true, "v2")]
        public async Task RemoveMyClientProvider_BuildsVersionedUrl(bool useV2, string version)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).RemoveMyClientProvider(_provider);

            Assert.Equal(HttpMethod.Delete, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/my/clientproviders?provider={_provider}", handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false)]
        [InlineData(true)]
        public async Task RemoveMyClientAccessPackages_BuildsVersionedUrl(bool useV2)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).RemoveMyClientAccessPackages(_provider, _client, _payload);

            if (useV2)
            {
                Assert.Equal(HttpMethod.Post, handler.Request.Method);
                Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/my/clients/accesspackages/delete?provider={_provider}&client={_client}", handler.Request.RequestUri.ToString());
            }
            else
            {
                Assert.Equal(HttpMethod.Delete, handler.Request.Method);
                Assert.Equal($"{BaseUrl}v1/enduser/clientdelegations/my/clients?provider={_provider}&from={_client}", handler.Request.RequestUri.ToString());
            }
        }

        [Theory]
        [InlineData(false, "v1")]
        [InlineData(true, "v2")]
        public async Task GetClients_BuildsVersionedUrl(bool useV2, string version)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).GetClients(_party, new List<string> { "DAGL" });

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/clients?party={_party}&roles=DAGL", handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false, "v1")]
        [InlineData(true, "v2")]
        public async Task GetAgents_BuildsVersionedUrl(bool useV2, string version)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).GetAgents(_party);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/agents?party={_party}", handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false, "v1", "to")]
        [InlineData(true, "v2", "agent")]
        public async Task GetAgentAccessPackages_BuildsVersionedUrl(bool useV2, string version, string agentParam)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).GetAgentAccessPackages(_party, _agent);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/agents/accesspackages?party={_party}&{agentParam}={_agent}", handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false, "v1", "from")]
        [InlineData(true, "v2", "client")]
        public async Task GetClientAccessPackages_BuildsVersionedUrl(bool useV2, string version, string clientParam)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).GetClientAccessPackages(_party, _client);

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/clients/accesspackages?party={_party}&{clientParam}={_client}", handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false)]
        [InlineData(true)]
        public async Task AddAgentAccessPackages_BuildsVersionedUrl(bool useV2)
        {
            RecordingHandler handler = new RecordingHandler("[]");

            await CreateClient(useV2, handler).AddAgentAccessPackages(_party, _client, _agent, _payload);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            string expectedUrl = useV2
                ? $"{BaseUrl}v2/enduser/clientdelegations/agents/accesspackages?party={_party}&client={_client}&agent={_agent}"
                : $"{BaseUrl}v1/enduser/clientdelegations/agents/accesspackages?party={_party}&from={_client}&to={_agent}";
            Assert.Equal(expectedUrl, handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false)]
        [InlineData(true)]
        public async Task RemoveAgentAccessPackages_BuildsVersionedUrl(bool useV2)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).RemoveAgentAccessPackages(_party, _client, _agent, _payload);

            if (useV2)
            {
                Assert.Equal(HttpMethod.Post, handler.Request.Method);
                Assert.Equal($"{BaseUrl}v2/enduser/clientdelegations/agents/accesspackages/delete?party={_party}&client={_client}&agent={_agent}", handler.Request.RequestUri.ToString());
            }
            else
            {
                Assert.Equal(HttpMethod.Delete, handler.Request.Method);
                Assert.Equal($"{BaseUrl}v1/enduser/clientdelegations/agents/accesspackages?party={_party}&from={_client}&to={_agent}", handler.Request.RequestUri.ToString());
            }
        }

        [Theory]
        [InlineData(false, "v1", "to")]
        [InlineData(true, "v2", "agent")]
        public async Task AddAgent_BuildsVersionedUrl(bool useV2, string version, string agentParam)
        {
            RecordingHandler handler = new RecordingHandler("{}");

            await CreateClient(useV2, handler).AddAgent(_party, _agent);

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/agents?party={_party}&{agentParam}={_agent}", handler.Request.RequestUri.ToString());
        }

        [Theory]
        [InlineData(false, "v1", "to")]
        [InlineData(true, "v2", "agent")]
        public async Task RemoveAgent_BuildsVersionedUrl(bool useV2, string version, string agentParam)
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(useV2, handler).RemoveAgent(_party, _agent);

            Assert.Equal(HttpMethod.Delete, handler.Request.Method);
            Assert.Equal($"{BaseUrl}{version}/enduser/clientdelegations/agents?party={_party}&{agentParam}={_agent}&cascade=true", handler.Request.RequestUri.ToString());
        }
    }
}
