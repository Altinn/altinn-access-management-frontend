using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="SystemUserControllerTest"></see>
    /// </summary>
    [Collection("SystemUserControllerTest")]
    public class SystemUserControllerTest : IClassFixture<CustomWebApplicationFactory<SystemUserController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SystemUserControllerTest(CustomWebApplicationFactory<SystemUserController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetSystemUsers checks that all systems users for given party are returned
        ///     Expected: GetSystemUsers returns the system users for given party
        /// </summary>
        [Fact]
        public async Task GetSystemUsers_ReturnsAllSystemUsers()
        {
            // Arrange
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUsers.json");
            List<SystemUserFE> expectedResponse = Util.GetMockData<List<SystemUserFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/51329012");
            List<SystemUserFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<SystemUserFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetSystemUser checks that systems user with given id for given party is returned
        ///     Expected: GetSystemUser returns the system user with given id for given party
        /// </summary>
        [Fact]
        public async Task GetSystemUser_ReturnsSpecificSystemUser()
        {
            // Arrange
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUsers.json");
            SystemUserFE expectedResponse = Util.GetMockData<List<SystemUserFE>>(path)[0];

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/51329012/123e4567-e89b-12d3-a456-426614174000");
            SystemUserFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<SystemUserFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetSystemUser checks that systems user with given id for given party is not returned
        ///     Expected: GetSystemUser returns NotFound for the system user with given id for given party
        /// </summary>
        [Fact]
        public async Task GetSystemUser_ReturnsNotFound()
        {
            // Arrange
            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/51329012/e60073ad-c661-4ca0-b74c-40238ad333e9");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: DeleteSystemUser checks that systems user with given id for given party is deleted
        ///     Expected: DeleteSystemUser deletes the system user with given id for given party
        /// </summary>
        [Fact]
        public async Task DeleteSystemUser_ReturnsAccepted()
        {
            // Arrange
            HttpStatusCode expectedResponse = HttpStatusCode.Accepted;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/51329012/123e4567-e89b-12d3-a456-426614174000");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: DeleteSystemUser checks that systems user with given id for given party is deleted
        ///     Expected: DeleteSystemUser deletes the system user with given id for given party
        /// </summary>
        [Fact]
        public async Task DeleteSystemUser_ReturnsNoContent()
        {
            // Arrange
            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/51329012/e60073ad-c661-4ca0-b74c-40238ad333e9");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: DeleteSystemUser checks that systems user with given id for given party is deleted
        ///     Expected: DeleteSystemUser deletes the system user with given id for given party
        /// </summary>
        [Fact]
        public async Task PostSystemUser_ReturnsNewSystemUserId()
        {
            // Arrange
            string expectedResponse = "eb9c9edf-a32f-424c-b475-6d47a0e7621f";
            NewSystemUserRequest dto = new NewSystemUserRequest
            {
                IntegrationTitle = "Fiken",
                SystemId = "910493353_fiken_demo_product",
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/51329012", content);
            string actualResponse = await httpResponse.Content.ReadFromJsonAsync<string>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }
    }
}