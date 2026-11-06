using System.Net;
using Altinn.AccessManagement.UI.Core.Constants;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
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
    /// Tests that <see cref="ProfileClient"/> turns the responses from the notification address
    /// endpoints in Profile into results the BFF can pass on to the frontend.
    /// </summary>
    public class ProfileClientTest
    {
        private const string OrgNumber = "310202398";

        private static readonly NotificationAddressModel _address = new NotificationAddressModel { Email = "test@example.com" };

        private sealed class FixedResponseHandler : HttpMessageHandler
        {
            private readonly string _responseContent;
            private readonly HttpStatusCode _statusCode;

            public FixedResponseHandler(string responseContent, HttpStatusCode statusCode)
            {
                _responseContent = responseContent;
                _statusCode = statusCode;
            }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                return Task.FromResult(new HttpResponseMessage
                {
                    StatusCode = _statusCode,
                    Content = new StringContent(_responseContent),
                });
            }
        }

        private static ProfileClient CreateClient(string responseContent, HttpStatusCode statusCode)
        {
            PlatformSettings platformSettings = new PlatformSettings
            {
                ApiProfileEndpoint = "http://localhost:5117/profile/api/v1/",
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            return new ProfileClient(
                new HttpClient(new FixedResponseHandler(responseContent, statusCode)),
                NullLogger<ProfileClient>.Instance,
                new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
                Options.Create(platformSettings),
                Mock.Of<IAccessTokenProvider>());
        }

        [Fact]
        public async Task GetOrgNotificationAddresses_NotFound_ReturnsEmptyList()
        {
            ProfileClient client = CreateClient(string.Empty, HttpStatusCode.NotFound);

            List<NotificationAddressResponse> addresses = await client.GetOrgNotificationAddresses(OrgNumber);

            Assert.Empty(addresses);
        }

        [Fact]
        public async Task GetOrgNotificationAddresses_ServerError_Throws()
        {
            ProfileClient client = CreateClient(string.Empty, HttpStatusCode.InternalServerError);

            await Assert.ThrowsAnyAsync<Exception>(() => client.GetOrgNotificationAddresses(OrgNumber));
        }

        [Theory]
        [InlineData(HttpStatusCode.OK)]
        [InlineData(HttpStatusCode.Created)]
        public async Task PostNewOrganisationNotificationAddress_Success_ReturnsAddress(HttpStatusCode statusCode)
        {
            string body = "{\"notificationAddressId\":12,\"email\":\"test@example.com\"}";

            Result<NotificationAddressResponse> result = await CreateClient(body, statusCode).PostNewOrganisationNotificationAddress(OrgNumber, _address);

            Assert.False(result.IsProblem);
            Assert.Equal(12, result.Value.NotificationAddressId);
            Assert.Equal("test@example.com", result.Value.Email);
        }

        [Fact]
        public async Task PostNewOrganisationNotificationAddress_OrganizationNotInEr_ReturnsProblem()
        {
            string body = "{\"title\":\"Invalid Organization Number\",\"status\":400,\"detail\":\"The provided organization number is not valid in enhetsregisteret.\"}";

            Result<NotificationAddressResponse> result = await CreateClient(body, HttpStatusCode.BadRequest).PostNewOrganisationNotificationAddress(OrgNumber, _address);

            Assert.True(result.IsProblem);
            Assert.Equal(SettingsProblem.OrganizationNotInEr.ErrorCode, result.Problem.ErrorCode);
        }

        [Fact]
        public async Task UpdateOrganisationNotificationAddress_Conflict_ReturnsAddressAlreadyExists()
        {
            string body = "{\"title\":\"Conflict\",\"status\":409,\"detail\":\"A notification address with the same address already exists.\"}";

            Result<NotificationAddressResponse> result = await CreateClient(body, HttpStatusCode.Conflict).UpdateOrganisationNotificationAddress(OrgNumber, 12, _address);

            Assert.True(result.IsProblem);
            Assert.Equal(SettingsProblem.AddressAlreadyExists.ErrorCode, result.Problem.ErrorCode);
        }

        [Fact]
        public async Task DeleteOrganisationNotificationAddress_Conflict_ReturnsCannotDeleteLastAddress()
        {
            string body = "{\"title\":\"Conflict\",\"status\":409,\"detail\":\"Cannot delete the last notification address\"}";

            Result<NotificationAddressResponse> result = await CreateClient(body, HttpStatusCode.Conflict).DeleteOrganisationNotificationAddress(OrgNumber, 12);

            Assert.True(result.IsProblem);
            Assert.Equal(SettingsProblem.CannotDeleteLastAddress.ErrorCode, result.Problem.ErrorCode);
        }
    }
}
