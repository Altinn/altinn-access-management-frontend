using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Clients
{
    /// <summary>
    /// Tests that socket errors towards the access management API surface as a retryable
    /// 503 problem instead of bubbling up as an unhandled exception (500).
    /// </summary>
    public class ConsentClientTest
    {
        private const string BaseUrl = "http://localhost:5117/accessmanagement/api/";

        private static readonly Guid _consentId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        private static readonly Guid _partyId = Guid.Parse("66666666-6666-6666-6666-666666666666");

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

        private static ConsentClient CreateClient(Exception exception)
        {
            PlatformSettings platformSettings = new()
            {
                ApiAccessManagementEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            return new ConsentClient(
                NullLogger<ConsentClient>.Instance,
                new HttpClient(new ThrowingHandler(exception)),
                new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
                new Mock<IHttpClientFactory>().Object,
                Options.Create(platformSettings));
        }

        /// <summary>
        /// A dropped connection reaches the client as a SocketException nested inside HttpRequestException.
        /// </summary>
        private static HttpRequestException SocketError()
            => new HttpRequestException(
                "An error occurred while sending the request.",
                new IOException("The response ended prematurely.", new SocketException((int)System.Net.Sockets.SocketError.ConnectionReset)));

        /// <summary>
        /// A socket error is transient, so callers must get a 503 they can retry on rather than a 500 —
        /// end users acting on a consent request in the frontend, external clients calling the BFF, and e2e tests alike.
        /// </summary>
        [Fact]
        public async Task ApproveConsentRequest_SocketException_ReturnsServiceUnavailable()
        {
            Result<bool> result = await CreateClient(SocketError()).ApproveConsentRequest(_consentId, new ApproveConsentContext { Language = "nb" }, CancellationToken.None);

            AssertServiceUnavailable(result.IsProblem, result.Problem);
        }

        /// <summary>
        /// Rejecting is just as exposed to transient network errors as approving.
        /// </summary>
        [Fact]
        public async Task RejectConsentRequest_SocketException_ReturnsServiceUnavailable()
        {
            Result<bool> result = await CreateClient(SocketError()).RejectConsentRequest(_consentId, CancellationToken.None);

            AssertServiceUnavailable(result.IsProblem, result.Problem);
        }

        /// <summary>
        /// The consent request details page must fail retryably instead of as a 500.
        /// </summary>
        [Fact]
        public async Task GetConsentRequest_SocketException_ReturnsServiceUnavailable()
        {
            Result<ConsentRequestDetails> result = await CreateClient(SocketError()).GetConsentRequest(_consentId, CancellationToken.None);

            AssertServiceUnavailable(result.IsProblem, result.Problem);
        }

        /// <summary>
        /// The consent log listing must fail retryably instead of as a 500.
        /// </summary>
        [Fact]
        public async Task GetConsentList_SocketException_ReturnsServiceUnavailable()
        {
            Result<List<ConsentRequestDetails>> result = await CreateClient(SocketError()).GetConsentList(_partyId, CancellationToken.None);

            AssertServiceUnavailable(result.IsProblem, result.Problem);
        }

        /// <summary>
        /// An active consent's details must fail retryably instead of as a 500.
        /// </summary>
        [Fact]
        public async Task GetConsent_SocketException_ReturnsServiceUnavailable()
        {
            Result<Consent> result = await CreateClient(SocketError()).GetConsent(_consentId, CancellationToken.None);

            AssertServiceUnavailable(result.IsProblem, result.Problem);
        }

        /// <summary>
        /// Revoking an active consent must fail retryably instead of as a 500.
        /// </summary>
        [Fact]
        public async Task RevokeConsent_SocketException_ReturnsServiceUnavailable()
        {
            Result<bool> result = await CreateClient(SocketError()).RevokeConsent(_consentId, CancellationToken.None);

            AssertServiceUnavailable(result.IsProblem, result.Problem);
        }

        /// <summary>
        /// The pending-request badge count must fail retryably instead of as a 500.
        /// </summary>
        [Fact]
        public async Task GetConsentRequestCount_SocketException_ReturnsServiceUnavailable()
        {
            Result<int> result = await CreateClient(SocketError()).GetConsentRequestCount(_partyId, ConsentRequestStatusType.Created, CancellationToken.None);

            AssertServiceUnavailable(result.IsProblem, result.Problem);
        }

        /// <summary>
        /// Only socket errors are transient. Every other failure must keep bubbling up as before, so
        /// genuine server-side errors are not disguised as something callers should retry.
        /// </summary>
        [Fact]
        public async Task ApproveConsentRequest_OtherException_Rethrows()
        {
            HttpRequestException otherError = new("Bad gateway", new InvalidOperationException("nope"));

            await Assert.ThrowsAsync<HttpRequestException>(
                () => CreateClient(otherError).ApproveConsentRequest(_consentId, new ApproveConsentContext { Language = "nb" }, CancellationToken.None));
        }

        private static void AssertServiceUnavailable(bool isProblem, ProblemInstance problem)
        {
            Assert.True(isProblem);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (HttpStatusCode)problem.StatusCode);
            Assert.Equal("CTUI-00100", problem.ErrorCode.ToString());
        }
    }
}
