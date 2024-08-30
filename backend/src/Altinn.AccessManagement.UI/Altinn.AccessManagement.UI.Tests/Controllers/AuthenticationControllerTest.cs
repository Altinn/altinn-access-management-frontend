using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Altinn.Common.PEP.Interfaces;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="AuthenticationController"></see>
    /// </summary>
    [Collection("AuthenticationController Tests")]
    public class AuthenticationControllerTest : IClassFixture<CustomWebApplicationFactory<AuthenticationController>>
    {
        private readonly CustomWebApplicationFactory<AuthenticationController> _factory;
        private readonly HttpClient _client;
        private readonly HttpClient _clientForNullToken;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public AuthenticationControllerTest(CustomWebApplicationFactory<AuthenticationController> factory)
        {
            _factory = factory;
            _client = GetTestClient();
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            _clientForNullToken = GetTestClientForEmptyRefreshToken();
            _clientForNullToken.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _clientForNullToken.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        private HttpClient GetTestClient()
        {
            HttpClient client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton<IAuthenticationClient, AuthenticationMock>();
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                    services.AddSingleton<IPDP, PdpPermitMock>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            client.DefaultRequestHeaders.Add("Cookie", "altinnPersistentContext=UL=1044");
            client.DefaultRequestHeaders.Add("Cookie", "selectedLanguage=no_nb");
            return client;
        }

        private HttpClient GetTestClientForEmptyRefreshToken()
        {
            HttpClient client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton<IAuthenticationClient, AuthenticationNullRefreshMock>();
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                    services.AddSingleton<IPDP, PdpPermitMock>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            return client;
        }

        /// <summary>
        /// Test case: Refresh returns authorized for a valid bearer token
        /// Expected: Refresh returns authorized
        /// </summary>
        [Fact]
        public async Task Refresh_ValidToken()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/authentication/refresh");
            string expectedCookie = "AltinnStudioRuntime";
            string actualCookie = response.Headers.GetValues("Set-Cookie").FirstOrDefault();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(expectedCookie, actualCookie);
        }

        /// <summary>
        /// Test case: Refresh returns unauthorized for an invalid token
        /// Expected: Refresh returns unauthorized
        /// </summary>
        [Fact]
        public async Task Refresh_InValidToken()
        {
            // Arrange
            _client.DefaultRequestHeaders.Remove("Authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "This is an invalid token");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/authentication/refresh");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        /// <summary>
        /// Test case: Refresh returns badrequest when the authentication client returns null
        /// Expected: Refresh returns badrequest
        /// </summary>
        [Fact]
        public async Task Refresh_ReturnsNull()
        {
            // Act
            HttpResponseMessage response = await _clientForNullToken.GetAsync($"accessmanagement/api/v1/authentication/refresh");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: Refresh returns refreshed token for a valid cookie and antiforgerytoken
        /// Expected: Refresh returns refreshed token
        /// </summary>
        [Fact]
        public async Task Refresh_ValidCookieAndAntiForgeryToken()
        {
            // Arrange
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");
            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");
            SetupUtils.AddLanguageCookie(httpRequestMessage);
            HttpResponseMessage response = await _client.SendAsync(httpRequestMessage);
            IEnumerable<string> cookieHeaders = response.Headers.GetValues("Set-Cookie");
            string value = cookieHeaders.ElementAt(1).Split("=")[1].Trim();
            string antiforgeryToken = value.Split(";")[0].Trim();

            // Act
            httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/api/v1/authentication/refresh");
            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");
            _client.DefaultRequestHeaders.Add("X-XSRF-TOKEN", antiforgeryToken);
            response = await _client.SendAsync(httpRequestMessage);
            string expectedCookie = "AltinnStudioRuntime";
            string actualCookie = response.Headers.GetValues("Set-Cookie").FirstOrDefault();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(expectedCookie, actualCookie);
        }

        /// <summary>
        /// Test case: Refresh returns refreshed token for a valid cookie and antiforgerytoken
        /// Expected: Refresh returns refreshed token
        /// </summary>
        [Fact(Skip = "???")]
        public async Task Refresh_ValidCookieAndMissingAntiForgeryToken()
        {
            // Arrange
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/api/v1/authentication/refresh");
            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");

            // Act
            HttpResponseMessage response = await _client.SendAsync(httpRequestMessage);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
