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
    public class SystemUserChangeRequestClientTest
    {
        private const string BaseUrl = "http://localhost:5117/authentication/api/v1/";

        private static readonly Guid _changeRequestId = Guid.Parse("55555555-5555-5555-5555-555555555555");

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

        private static SystemUserChangeRequestClient CreateClient(Exception exception)
        {
            PlatformSettings platformSettings = new()
            {
                ApiAuthenticationEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            return new SystemUserChangeRequestClient(
                NullLogger<SystemUserChangeRequestClient>.Instance,
                new HttpClient(new ThrowingHandler(exception)),
                new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
                Options.Create(platformSettings));
        }

        /// <summary>
        /// A dropped connection reaches the client as a SocketException nested inside HttpRequestException.
        /// </summary>
        private static Exception SocketError()
            => new HttpRequestException(
                "An error occurred while sending the request.",
                new IOException("The response ended prematurely.", new SocketException((int)System.Net.Sockets.SocketError.ConnectionReset)));

        /// <summary>
        /// A socket error is transient, so callers must get a 503 they can retry on rather than a 500 —
        /// end users approving a change request in the frontend, external clients calling the BFF, and e2e tests alike.
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserChangeRequest_SocketException_ReturnsServiceUnavailable()
        {
            Result<bool> result = await CreateClient(SocketError()).ApproveSystemUserChangeRequest(51329012, _changeRequestId, CancellationToken.None);

            Assert.True(result.IsProblem);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (HttpStatusCode)result.Problem.StatusCode);
            Assert.Equal("AMUI-00100", result.Problem.ErrorCode.ToString());
        }

        /// <summary>
        /// Rejecting is just as exposed to transient network errors as approving.
        /// </summary>
        [Fact]
        public async Task RejectSystemUserChangeRequest_SocketException_ReturnsServiceUnavailable()
        {
            Result<bool> result = await CreateClient(SocketError()).RejectSystemUserChangeRequest(51329012, _changeRequestId, CancellationToken.None);

            Assert.True(result.IsProblem);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (HttpStatusCode)result.Problem.StatusCode);
            Assert.Equal("AMUI-00100", result.Problem.ErrorCode.ToString());
        }

        /// <summary>
        /// Loading the change request itself must also fail retryably instead of as a 500.
        /// </summary>
        [Fact]
        public async Task GetSystemUserChangeRequest_SocketException_ReturnsServiceUnavailable()
        {
            Result<Core.Models.SystemUser.SystemUserChangeRequest> result = await CreateClient(SocketError()).GetSystemUserChangeRequest(_changeRequestId, CancellationToken.None);

            Assert.True(result.IsProblem);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (HttpStatusCode)result.Problem.StatusCode);
            Assert.Equal("AMUI-00100", result.Problem.ErrorCode.ToString());
        }

        /// <summary>
        /// Only socket errors are transient. Every other failure must keep bubbling up as before, so
        /// genuine server-side errors are not disguised as something callers should retry.
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserChangeRequest_OtherException_Rethrows()
        {
            Exception otherError = new HttpRequestException("Bad gateway", new InvalidOperationException("nope"));

            await Assert.ThrowsAsync<HttpRequestException>(
                () => CreateClient(otherError).ApproveSystemUserChangeRequest(51329012, _changeRequestId, CancellationToken.None));
        }
    }
}
