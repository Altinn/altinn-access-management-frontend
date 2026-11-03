using System.Net;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Tests.Clients
{
    /// <summary>
    /// Tests that <see cref="BankruptcyEstateClient"/> calls the expected url and maps
    /// the downstream status codes to a result or an exception.
    /// </summary>
    public class BankruptcyEstateClientTest
    {
        private const string BaseUrl = "http://localhost:5117/accessmanagement/api/";

        private static readonly Guid _party = Guid.Parse("11111111-1111-1111-1111-111111111111");

        /// <summary>
        /// Handler that records the outgoing request and returns a fixed response.
        /// </summary>
        private sealed class RecordingHandler : HttpMessageHandler
        {
            private readonly string _responseContent;
            private readonly HttpStatusCode _statusCode;

            public RecordingHandler(string responseContent = "true", HttpStatusCode statusCode = HttpStatusCode.OK)
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

        private static BankruptcyEstateClient CreateClient(RecordingHandler handler)
        {
            PlatformSettings platformSettings = new PlatformSettings
            {
                ApiAccessManagementEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            return new BankruptcyEstateClient(
                new HttpClient(handler),
                NullLogger<BankruptcyEstateClient>.Instance,
                new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
                Options.Create(platformSettings));
        }

        [Fact]
        public async Task HasAnyEstates_CallsEstatesAnyUrl()
        {
            RecordingHandler handler = new RecordingHandler();

            bool result = await CreateClient(handler).HasAnyEstates(_party);

            Assert.True(result);
            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v1/enduser/bankruptcyestate/estates/any?party={_party}", handler.Request.RequestUri.ToString());
        }

        /// <summary>
        /// A party without estates is answered with Forbidden downstream. That is a normal
        /// outcome for the UI, not an error, so it must come back as false.
        /// </summary>
        [Fact]
        public async Task HasAnyEstates_ForbiddenReturnsFalse()
        {
            RecordingHandler handler = new RecordingHandler(string.Empty, HttpStatusCode.Forbidden);

            bool result = await CreateClient(handler).HasAnyEstates(_party);

            Assert.False(result);
        }

        [Fact]
        public async Task HasAnyEstates_ThrowsOnErrorResponse()
        {
            RecordingHandler handler = new RecordingHandler("upstream is down", HttpStatusCode.InternalServerError);

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(handler).HasAnyEstates(_party));

            Assert.Equal(HttpStatusCode.InternalServerError, exception.StatusCode);
        }
    }
}