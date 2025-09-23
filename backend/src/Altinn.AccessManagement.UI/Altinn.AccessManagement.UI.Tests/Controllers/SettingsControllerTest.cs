using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Profile;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Microsoft.AspNetCore.Http;

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
    }
}