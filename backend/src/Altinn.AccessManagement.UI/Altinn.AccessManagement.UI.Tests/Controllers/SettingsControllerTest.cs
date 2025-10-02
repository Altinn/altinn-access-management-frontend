using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

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
    }
}