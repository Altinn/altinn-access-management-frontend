using System.Linq.Expressions;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Sockets;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Tests that a socket error thrown by any integration client during a request is turned into a
    ///     retryable 503 by the global exception filter, no matter which client threw it.
    ///     The consent log is used as the example: it fans out to the register API, which is where the
    ///     socket errors seen in production have been thrown.
    /// </summary>
    public class TransientNetworkExceptionFilterTest : IClassFixture<CustomWebApplicationFactory<ConsentController>>
    {
        private const string Party = "cd35779b-b174-4ecc-bbef-ece13611be7f";

        private const string ConsentRequestId = "10fded43-fcd4-4f32-b31c-725fdaba6139";

        private readonly CustomWebApplicationFactory<ConsentController> _factory;

        /// <summary>
        ///     Constructor setting up the factory used to build test clients
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public TransientNetworkExceptionFilterTest(CustomWebApplicationFactory<ConsentController> factory)
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

        /// <summary>
        ///     Approving a consent request is the action a user is most exposed on, it is a POST, and the socket
        ///     error comes from the consent client itself rather than from a client further down. It must give the
        ///     same retryable 503.
        /// </summary>
        [Fact]
        public async Task ApproveConsent_SocketExceptionFromConsentClient_ReturnsServiceUnavailable()
        {
            HttpClient client = GetTestClientWithThrowingConsentClient(new HttpRequestException(
                "An error occurred while sending the request.",
                new IOException("The response ended prematurely.", new SocketException((int)SocketError.ConnectionReset))));

            HttpResponseMessage httpResponse = await client.PostAsJsonAsync(
                $"accessmanagement/api/v1/consent/request/{ConsentRequestId}/approve",
                new ApproveConsentContext { Language = "nb" });
            AltinnProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            Assert.Equal(HttpStatusCode.ServiceUnavailable, httpResponse.StatusCode);
            Assert.Equal("AMUI-00100", problemDetails.Code);
        }

        private HttpClient GetTestClient(Exception exception) => GetTestClient(services =>
        {
            services.AddTransient<IConsentClient, ConsentClientMock>();
            services.AddTransient(_ => ThrowingClient<IRegisterClient>(c => c.GetPartyList(It.IsAny<List<Guid>>()), exception));
        });

        private HttpClient GetTestClientWithThrowingConsentClient(Exception exception) => GetTestClient(services =>
        {
            services.AddTransient(_ => ThrowingClient<IConsentClient>(c => c.ApproveConsentRequest(It.IsAny<Guid>(), It.IsAny<ApproveConsentContext>(), It.IsAny<CancellationToken>()), exception));
            services.AddTransient<IRegisterClient, RegisterClientMock>();
        });

        private HttpClient GetTestClient(Action<IServiceCollection> clients)
        {
            WebApplicationFactory<ConsentController> factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IEncryptionService, EncryptionServiceMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<IResourceRegistryClient, ResourceRegistryClientMock>();
                    clients(services);
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
        ///     Builds a client whose one relevant call fails the way a broken connection does. Everything else on
        ///     the interface is left at its default, since the request never gets that far.
        /// </summary>
        private static TClient ThrowingClient<TClient>(Expression<Func<TClient, object>> call, Exception exception)
            where TClient : class
        {
            Mock<TClient> client = new();
            client.Setup(call).Throws(exception);

            return client.Object;
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
