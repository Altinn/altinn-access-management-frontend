using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Tests.Clients
{
    /// <summary>
    /// Tests that socket errors towards the authentication API surface as a retryable
    /// 503 problem instead of bubbling up as an unhandled exception (500).
    /// </summary>
    public class SystemUserRequestClientTest
    {
        private const string BaseUrl = "http://localhost:5117/authentication/api/v1/";

        private static readonly Guid _requestId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        /// <summary>
        /// Handler that fails every request with the given exception.
        /// </summary>
        private sealed class ThrowingHandler(Exception exception) : HttpMessageHandler
        {
            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                throw exception;
            }
        }

        private static SystemUserRequestClient CreateClient(Exception exception)
        {
            PlatformSettings platformSettings = new()
            {
                ApiAuthenticationEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            return new SystemUserRequestClient(
                NullLogger<SystemUserRequestClient>.Instance,
                new HttpClient(new ThrowingHandler(exception)),
                new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
                Options.Create(platformSettings));
        }

        /// <summary>
        /// A socket error is transient, so callers must get a 503 they can retry on rather than a 500 —
        /// end users approving a request in the frontend, external clients calling the BFF, and e2e tests alike.
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserRequest_SocketException_ReturnsServiceUnavailable()
        {
            // A dropped connection reaches the client as a SocketException nested inside HttpRequestException
            Exception socketError = new HttpRequestException(
                "An error occurred while sending the request.",
                new IOException("The response ended prematurely.", new SocketException((int)SocketError.ConnectionReset)));

            Result<bool> result = await CreateClient(socketError).ApproveSystemUserRequest(51329012, _requestId, CancellationToken.None);

            Assert.True(result.IsProblem);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (HttpStatusCode)result.Problem.StatusCode);
            Assert.Equal("AMUI-00100", result.Problem.ErrorCode.ToString());
        }

        /// <summary>
        /// Only socket errors are transient. Every other failure must keep bubbling up as before, so
        /// genuine server-side errors are not disguised as something callers should retry.
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserRequest_OtherException_Rethrows()
        {
            Exception otherError = new HttpRequestException("Bad gateway", new InvalidOperationException("nope"));

            await Assert.ThrowsAsync<HttpRequestException>(
                () => CreateClient(otherError).ApproveSystemUserRequest(51329012, _requestId, CancellationToken.None));
        }
    }
}
