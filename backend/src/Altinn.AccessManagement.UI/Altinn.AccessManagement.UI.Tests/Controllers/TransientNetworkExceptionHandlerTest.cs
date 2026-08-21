using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Sockets;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Altinn.Platform.Models.Register;
using Altinn.Register.Contracts.V1;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Tests that a socket error thrown by any integration client during a request is turned into a
    ///     retryable 503 by the global exception handler, no matter which client threw it.
    ///     The consent log is used as the example: it fans out to the register API, which is where the
    ///     socket errors seen in production have been thrown.
    /// </summary>
    public class TransientNetworkExceptionHandlerTest : IClassFixture<CustomWebApplicationFactory<ConsentController>>
    {
        private const string Party = "cd35779b-b174-4ecc-bbef-ece13611be7f";

        private readonly CustomWebApplicationFactory<ConsentController> _factory;

        /// <summary>
        ///     Constructor setting up the factory used to build test clients
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public TransientNetworkExceptionHandlerTest(CustomWebApplicationFactory<ConsentController> factory)
        {
            _factory = factory;
        }

        /// <summary>
        ///     A socket error is transient, so the caller must get a 503 it can retry on. The register client
        ///     rethrows on failure, so without the global handler this request ends as a 500.
        /// </summary>
        [Fact]
        public async Task GetConsentLog_SocketExceptionFromRegisterClient_ReturnsServiceUnavailable()
        {
            HttpClient client = GetTestClient(new HttpRequestException(
                "An error occurred while sending the request.",
                new IOException("The response ended prematurely.", new SocketException((int)SocketError.ConnectionReset))));

            HttpResponseMessage httpResponse = await client.GetAsync($"accessmanagement/api/v1/consent/log/{Party}");
            AltinnProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            Assert.Equal(HttpStatusCode.ServiceUnavailable, httpResponse.StatusCode);
            Assert.Equal("AMUI-00100", problemDetails.Code);
        }

        /// <summary>
        ///     An HttpClient timeout surfaces as a cancellation wrapping a TimeoutException, and is just as
        ///     transient as a socket error.
        /// </summary>
        [Fact]
        public async Task GetConsentLog_TimeoutFromRegisterClient_ReturnsServiceUnavailable()
        {
            HttpClient client = GetTestClient(new TaskCanceledException(
                "The request was canceled due to the configured HttpClient.Timeout of 100 seconds elapsing.",
                new TimeoutException("A connection could not be established within the configured ConnectTimeout.")));

            HttpResponseMessage httpResponse = await client.GetAsync($"accessmanagement/api/v1/consent/log/{Party}");

            Assert.Equal(HttpStatusCode.ServiceUnavailable, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Only transient network errors are translated. Everything else must keep its existing behaviour,
        ///     so genuine errors are not disguised as something the caller should retry.
        /// </summary>
        [Fact]
        public async Task GetConsentLog_OtherException_IsNotTranslatedToServiceUnavailable()
        {
            HttpClient client = GetTestClient(new InvalidOperationException("nope"));

            HttpResponseMessage httpResponse = await client.GetAsync($"accessmanagement/api/v1/consent/log/{Party}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        private HttpClient GetTestClient(Exception exception)
        {
            WebApplicationFactory<ConsentController> factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IEncryptionService, EncryptionServiceMock>();
                    services.AddTransient<IConsentClient, ConsentClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<IRegisterClient>(_ => new ThrowingRegisterClient(exception));
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });

            factory.Server.AllowSynchronousIO = true;
            HttpClient client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                HandleCookies = true,
            });

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetAccessToken("sbl.authorization"));
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return client;
        }

        /// <summary>
        ///     Register client that behaves like the real one for everything but the party lookup, which fails
        ///     the way a broken connection does.
        /// </summary>
        private sealed class ThrowingRegisterClient(Exception exception) : IRegisterClient
        {
            private readonly RegisterClientMock _inner = new();

            public Task<List<Party>> GetPartyList(List<Guid> uuidList) => throw exception;

            public Task<Party> GetPartyForOrganization(string organizationNumber) => _inner.GetPartyForOrganization(organizationNumber);

            public Task<Party> GetPartyForPerson(string ssn) => _inner.GetPartyForPerson(ssn);

            public Task<Altinn.Register.Contracts.Party> GetParty(Guid uuid) => _inner.GetParty(uuid);

            public Task<Person> GetPerson(string ssn, string lastname) => _inner.GetPerson(ssn, lastname);

            public Task<List<PartyName>> GetPartyNames(IEnumerable<string> orgNumbers, CancellationToken cancellationToken) => _inner.GetPartyNames(orgNumbers, cancellationToken);
        }

        /// <summary>
        ///     The problem details shape returned by the BFF, including the Altinn error code.
        /// </summary>
        private sealed class AltinnProblemDetails
        {
            public string Code { get; set; }
        }
    }
}
