using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Net.Http.Headers;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Services;
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

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="SettingsController"/>
    /// </summary>
    [Collection("SettingsController Tests")]
    public class SettingsControllerTest : IClassFixture<CustomWebApplicationFactory<SettingsController>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<SettingsController> _factory;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SettingsControllerTest(CustomWebApplicationFactory<SettingsController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: Valid language codes update the persistent context cookie
        ///     Expected: Cookie is set with correct value and security attributes
        /// </summary>
        [Theory]
        [InlineData("nb", "UL=1044")]
        [InlineData("en", "UL=1033")]
        [InlineData("no_nn", "UL=2068")]
        public async Task UpdateSelectedLanguage_ValidLanguageCodes_SetCookie(string languageCode, string expectedCookieValue)
        {
            // Arrange
            var request = new { LanguageCode = languageCode };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync("accessmanagement/api/v1/settings/language/selectedLanguage", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.True(response.Headers.TryGetValues("Set-Cookie", out IEnumerable<string> cookieHeaders));
            string altinnCookie = cookieHeaders.FirstOrDefault(cookie => cookie.StartsWith("altinnPersistentContext=", StringComparison.OrdinalIgnoreCase));
            Assert.NotNull(altinnCookie);
            SetCookieHeaderValue parsedCookie = SetCookieHeaderValue.Parse(altinnCookie!);
            string cookieValue = parsedCookie.Value.ToString();
            Assert.Equal(expectedCookieValue, cookieValue);
            Assert.Equal("/", parsedCookie.Path.ToString());
            Assert.True(parsedCookie.HttpOnly);
            Assert.True(parsedCookie.Secure);
        }

        /// <summary>
        ///     Test case: Missing language code returns bad request
        ///     Expected: Returns BadRequest with validation message
        /// </summary>
        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public async Task UpdateSelectedLanguage_InvalidLanguageCode_ReturnsBadRequest(string invalidLanguageCode)
        {
            // Arrange
            var request = new { LanguageCode = invalidLanguageCode };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync("accessmanagement/api/v1/settings/language/selectedLanguage", request);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("\"Language code is required.\"", await response.Content.ReadAsStringAsync());
        }

        /// <summary>
        ///     Test case: Unsupported language code returns bad request
        ///     Expected: Returns BadRequest with validation message
        /// </summary>
        [Fact]
        public async Task UpdateSelectedLanguage_UnsupportedLanguage_ReturnsBadRequest()
        {
            // Arrange
            var request = new { LanguageCode = "de" };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync("accessmanagement/api/v1/settings/language/selectedLanguage", request);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("\"Unsupported language code.\"", await response.Content.ReadAsStringAsync());
        }

        /// <summary>
        ///     Test case: Null request body returns bad request
        ///     Expected: Returns BadRequest with validation message
        /// </summary>
        [Fact]
        public async Task UpdateSelectedLanguage_NullRequest_ReturnsBadRequest()
        {
            // Arrange
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, "accessmanagement/api/v1/settings/language/selectedLanguage")
            {
                Content = new StringContent("null", Encoding.UTF8, "application/json")
            };

            // Act
            HttpResponseMessage response = await _client.SendAsync(requestMessage);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("\"Language code is required.\"", await response.Content.ReadAsStringAsync());
        }

        /// <summary>
        ///     Test case: Fetch notification data for a valid organization
        ///     Expected: Return valid notification addresses
        /// </summary>
        [Fact]
        public async Task GetOrganisationNotificationAddresses_Valid()
        {
            // Arrange
            string orgNumber = "310202398";
            List<NotificationAddressResponse> expectedResult = Util.GetMockData<List<NotificationAddressResponse>>(_expectedDataPath + "/Settings/NotificationAddresses/310202398.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<NotificationAddressResponse> actualResources = JsonSerializer.Deserialize<List<NotificationAddressResponse>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Organization has no notification addresses (null response from service)
        ///     Expected: Returns BadRequest with problem details
        /// </summary>
        [Fact]
        public async Task GetOrganisationNotificationAddresses_NullFromService_ReturnsNoContent()
        {
            // Arrange
            string orgNumber = "999999999"; // Special org number that triggers null from ProfileClientMock

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Backend service throws exception
        ///     Expected: Returns InternalServerError
        /// </summary>
        [Fact]
        public async Task GetOrganisationNotificationAddresses_BackendError_ReturnsInternalServerError()
        {
            // Arrange
            string orgNumber = "000000000"; // Special org number that triggers exception in ProfileClientMock

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Multiple validation scenarios using Theory
        ///     Expected: All return BadRequest with validation message
        /// </summary>
        [Theory]
        [InlineData("123")]
        [InlineData("12345678901")]
        [InlineData("abc123def")]
        [InlineData("31020239A")]
        public async Task GetOrganisationNotificationAddresses_InvalidOrgNumbers_ReturnsBadRequest(string orgNumber)
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("\"Org number must be a number with 9 digits\"", await response.Content.ReadAsStringAsync());
        }

        /// <summary>
        ///     Test case: Post a new notification address for a valid organization
        ///     Expected: Return created notification address
        /// </summary>
        [Fact]
        public async Task PostNewOrganisationNotificationAddress_Valid()
        {
            // Arrange
            string orgNumber = "310202398";
            var notificationAddress = new NotificationAddressModel
            {
                Email = "test@example.com",
                Phone = null,
                CountryCode = null
            };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            NotificationAddressResponse actualResult = JsonSerializer.Deserialize<NotificationAddressResponse>(await response.Content.ReadAsStringAsync(), options);
            Assert.NotNull(actualResult);
            Assert.Equal(notificationAddress.Email, actualResult.Email);
            Assert.Equal(notificationAddress.Phone, actualResult.Phone);
            Assert.Equal(notificationAddress.CountryCode, actualResult.CountryCode);
            Assert.True(actualResult.NotificationAddressId > 0);
        }

        /// <summary>
        ///     Test case: Post a new phone notification address for a valid organization
        ///     Expected: Return created notification address with phone details
        /// </summary>
        [Fact]
        public async Task PostNewOrganisationNotificationAddress_PhoneAddress_Valid()
        {
            // Arrange
            string orgNumber = "310202398";
            var notificationAddress = new NotificationAddressModel
            {
                Email = null,
                Phone = "12345678",
                CountryCode = "+47"
            };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            NotificationAddressResponse actualResult = JsonSerializer.Deserialize<NotificationAddressResponse>(await response.Content.ReadAsStringAsync(), options);
            Assert.NotNull(actualResult);
            Assert.Equal(notificationAddress.Email, actualResult.Email);
            Assert.Equal(notificationAddress.Phone, actualResult.Phone);
            Assert.Equal(notificationAddress.CountryCode, actualResult.CountryCode);
            Assert.True(actualResult.NotificationAddressId > 0);
        }

        /// <summary>
        ///     Test case: Backend service throws exception during POST
        ///     Expected: Returns InternalServerError
        /// </summary>
        [Fact]
        public async Task PostNewOrganisationNotificationAddress_BackendError_ReturnsInternalServerError()
        {
            // Arrange
            string orgNumber = "000000000"; // Special org number that triggers exception in mock
            var notificationAddress = new NotificationAddressModel
            {
                Email = "test@example.com",
                Phone = null,
                CountryCode = null
            };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Multiple validation scenarios for POST endpoint using Theory
        ///     Expected: All return BadRequest with validation message
        /// </summary>
        [Theory]
        [InlineData("123")]
        [InlineData("12345678901")]
        [InlineData("abc123def")]
        [InlineData("31020239A")]
        public async Task PostNewOrganisationNotificationAddress_InvalidOrgNumbers_ReturnsBadRequest(string orgNumber)
        {
            // Arrange
            var notificationAddress = new NotificationAddressModel
            {
                Email = "test@example.com",
                Phone = null,
                CountryCode = null
            };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("\"Org number must be a number with 9 digits\"", await response.Content.ReadAsStringAsync());
        }

        /// <summary>
        ///     Test case: Delete a notification address for a valid organization
        ///     Expected: Return deleted notification address
        /// </summary>
        [Fact]
        public async Task DeleteOrganisationNotificationAddress_Valid()
        {
            // Arrange
            string orgNumber = "310202398";
            int notificationAddressId = 12345; // Use the ID that exists in the mock

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            NotificationAddressResponse actualResult = JsonSerializer.Deserialize<NotificationAddressResponse>(await response.Content.ReadAsStringAsync(), options);
            Assert.NotNull(actualResult);
            Assert.Equal(notificationAddressId, actualResult.NotificationAddressId);
        }

        /// <summary>
        ///     Test case: Delete a non-existent notification address
        ///     Expected: Returns NotFound
        /// </summary>
        [Fact]
        public async Task DeleteOrganisationNotificationAddress_NotFound_ReturnsNotFound()
        {
            // Arrange
            string orgNumber = "310202398";
            int notificationAddressId = 99999; // Use an ID that doesn't exist in the mock

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Backend service throws exception during DELETE
        ///     Expected: Returns InternalServerError
        /// </summary>
        [Fact]
        public async Task DeleteOrganisationNotificationAddress_BackendError_ReturnsInternalServerError()
        {
            // Arrange
            string orgNumber = "000000000"; // Special org number that triggers exception in mock
            int notificationAddressId = 1;

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Multiple validation scenarios for DELETE endpoint using Theory
        ///     Expected: All return BadRequest with validation message
        /// </summary>
        [Theory]
        [InlineData("123")]
        [InlineData("12345678901")]
        [InlineData("abc123def")]
        [InlineData("31020239A")]
        public async Task DeleteOrganisationNotificationAddress_InvalidOrgNumbers_ReturnsBadRequest(string orgNumber)
        {
            // Arrange
            int notificationAddressId = 1;

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("\"Org number must be a number with 9 digits\"", await response.Content.ReadAsStringAsync());
        }

        /// <summary>
        ///     Test case: Update notification address for a valid organization
        ///     Expected: Return updated notification address
        /// </summary>
        [Fact]
        public async Task UpdateOrganisationNotificationAddress_Valid()
        {
            // Arrange
            string orgNumber = "310202398";
            int notificationAddressId = 12345; // Use an ID that exists in the mock
            var notificationAddress = new NotificationAddressModel
            {
                Email = "updated@example.com",
                Phone = null,
                CountryCode = null
            };

            // Act
            HttpResponseMessage response = await _client.PutAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            NotificationAddressResponse actualResult = JsonSerializer.Deserialize<NotificationAddressResponse>(await response.Content.ReadAsStringAsync(), options);
            Assert.NotNull(actualResult);
            Assert.Equal(notificationAddress.Email, actualResult.Email);
            Assert.Equal(notificationAddress.Phone, actualResult.Phone);
            Assert.Equal(notificationAddress.CountryCode, actualResult.CountryCode);
            Assert.Equal(notificationAddressId, actualResult.NotificationAddressId);
        }

        /// <summary>
        ///     Test case: Update notification address with phone details for a valid organization
        ///     Expected: Return updated notification address with phone details
        /// </summary>
        [Fact]
        public async Task UpdateOrganisationNotificationAddress_PhoneAddress_Valid()
        {
            // Arrange
            string orgNumber = "310202398";
            int notificationAddressId = 12345; // Use an ID that exists in the mock
            var notificationAddress = new NotificationAddressModel
            {
                Email = null,
                Phone = "87654321",
                CountryCode = "+47"
            };

            // Act
            HttpResponseMessage response = await _client.PutAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            NotificationAddressResponse actualResult = JsonSerializer.Deserialize<NotificationAddressResponse>(await response.Content.ReadAsStringAsync(), options);
            Assert.NotNull(actualResult);
            Assert.Equal(notificationAddress.Email, actualResult.Email);
            Assert.Equal(notificationAddress.Phone, actualResult.Phone);
            Assert.Equal(notificationAddress.CountryCode, actualResult.CountryCode);
            Assert.Equal(notificationAddressId, actualResult.NotificationAddressId);
        }

        /// <summary>
        ///     Test case: Update a non-existent notification address
        ///     Expected: Returns NotFound
        /// </summary>
        [Fact]
        public async Task UpdateOrganisationNotificationAddress_NotFound_ReturnsNotFound()
        {
            // Arrange
            string orgNumber = "310202398";
            int notificationAddressId = 0; // Use an ID that doesn't exist in the mock
            var notificationAddress = new NotificationAddressModel
            {
                Email = "updated@example.com",
                Phone = null,
                CountryCode = null
            };

            // Act
            HttpResponseMessage response = await _client.PutAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Backend service throws exception during PUT
        ///     Expected: Returns InternalServerError
        /// </summary>
        [Fact]
        public async Task UpdateOrganisationNotificationAddress_BackendError_ReturnsInternalServerError()
        {
            // Arrange
            string orgNumber = "000000000"; // Special org number that triggers exception in mock
            int notificationAddressId = 1;
            var notificationAddress = new NotificationAddressModel
            {
                Email = "updated@example.com",
                Phone = null,
                CountryCode = null
            };

            // Act
            HttpResponseMessage response = await _client.PutAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Multiple validation scenarios for PUT endpoint using Theory
        ///     Expected: All return BadRequest with validation message
        /// </summary>
        [Theory]
        [InlineData("123")]
        [InlineData("12345678901")]
        [InlineData("abc123def")]
        [InlineData("31020239A")]
        public async Task UpdateOrganisationNotificationAddress_InvalidOrgNumbers_ReturnsBadRequest(string orgNumber)
        {
            // Arrange
            int notificationAddressId = 1;
            var notificationAddress = new NotificationAddressModel
            {
                Email = "updated@example.com",
                Phone = null,
                CountryCode = null
            };

            // Act
            HttpResponseMessage response = await _client.PutAsJsonAsync($"accessmanagement/api/v1/settings/org/{orgNumber}/notificationaddresses/{notificationAddressId}", notificationAddress);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("\"Org number must be a number with 9 digits\"", await response.Content.ReadAsStringAsync());
        }

        /// <summary>
        ///     Test case: Valid language code updates both cookie and profile setting
        ///     Expected: Returns OK — profile patch did not fail
        /// </summary>
        [Theory]
        [InlineData("no_nb")]
        [InlineData("no_nn")]
        [InlineData("en")]
        public async Task UpdateSelectedLanguage_ValidLanguageCode_AlsoPatchesProfileSetting(string languageCode)
        {
            // Arrange
            var request = new { LanguageCode = languageCode };

            // Act
            HttpResponseMessage response = await _client.PostAsJsonAsync("accessmanagement/api/v1/settings/language/selectedLanguage", request);

            // Assert — profile patch is called (via ProfileClientMock) and does not throw, so OK is returned
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        /// <summary>
        ///     Test case: POST with auth cookie present but X-XSRF-TOKEN header missing
        ///     Expected: Antiforgery filter rejects the request with 400 Bad Request
        /// </summary>
        [Fact]
        public async Task UpdateSelectedLanguage_WithAuthCookieAndMissingXsrfToken_ReturnsBadRequest()
        {
            // Arrange
            HttpClient client = GetCookieAuthTestClient();
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");

            var request = new HttpRequestMessage(HttpMethod.Post, "accessmanagement/api/v1/settings/language/selectedLanguage");
            request.Content = JsonContent.Create(new { LanguageCode = "nb" });
            // Auth cookie is present — this causes the antiforgery filter to fire.
            // Deliberately omit the X-XSRF-TOKEN header so validation fails.
            SetupUtils.AddAuthCookie(request, token, "AltinnStudioRuntime");

            // Act
            HttpResponseMessage response = await client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        ///     Test case: POST with auth cookie present and a valid X-XSRF-TOKEN header
        ///     Expected: Antiforgery filter passes and the request succeeds with 200 OK
        /// </summary>
        [Fact]
        public async Task UpdateSelectedLanguage_WithAuthCookieAndValidXsrfToken_ReturnsOk()
        {
            // Arrange
            HttpClient client = GetCookieAuthTestClient();
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");

            // First request: GET the home page to obtain an antiforgery token pair.
            // HomeController calls IAntiforgery.GetAndStoreTokens, which writes:
            //   Index 0 — AS-XSRF-TOKEN (server validation cookie, HttpOnly)
            //   Index 1 — XSRF-TOKEN   (JS-readable request token)
            // HandleCookies = true on the client automatically stores AS-XSRF-TOKEN
            // so it is sent on subsequent requests without manual handling.
            var homeRequest = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");
            SetupUtils.AddAuthCookie(homeRequest, token, "AltinnStudioRuntime");
            SetupUtils.AddLanguageCookie(homeRequest);
            HttpResponseMessage homeResponse = await client.SendAsync(homeRequest);

            IEnumerable<string> setCookieHeaders = homeResponse.Headers.GetValues("Set-Cookie");
            // Extract the request token value from the XSRF-TOKEN cookie header.
            // Cookie header format: "XSRF-TOKEN=<value>; path=/; samesite=strict"
            string xsrfToken = setCookieHeaders.ElementAt(1).Split("=")[1].Trim().Split(";")[0].Trim();

            // Act — POST with auth cookie and X-XSRF-TOKEN; AS-XSRF-TOKEN is sent
            // automatically by the client's cookie container.
            var request = new HttpRequestMessage(HttpMethod.Post, "accessmanagement/api/v1/settings/language/selectedLanguage");
            request.Content = JsonContent.Create(new { LanguageCode = "nb" });
            SetupUtils.AddAuthCookie(request, token, "AltinnStudioRuntime", xsrfToken);

            HttpResponseMessage response = await client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        private HttpClient GetCookieAuthTestClient()
        {
            return _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient<IProfileClient, ProfileClientMock>();
                    services.AddTransient<IAccessManagementClient, AccessManagementClientMock>();
                    services.AddTransient<IAccessManagementClientV0, AccessManagementClientV0Mock>();
                    services.AddTransient<IConnectionClient, ConnectionClientMock>();
                    services.AddTransient<IUserService, UserService>();
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false, HandleCookies = true });
        }
    }
}
