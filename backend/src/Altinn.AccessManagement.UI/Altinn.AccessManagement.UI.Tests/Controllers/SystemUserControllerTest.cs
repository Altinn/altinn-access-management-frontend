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
using Altinn.Authorization.ProblemDetails;

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
        public async Task GetSystemUsers_ReturnsAllSystemUsersNewestFirst()
        {
            // Arrange
            int partyId = 51329012;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUsers.json");
            List<SystemUserFE> expectedResponse = Util.GetMockData<List<SystemUserFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/{partyId}");
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
            int partyId = 51329012;
            string systemUserId = "123e4567-e89b-12d3-a456-426614174000";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUser.json");
            SystemUserFE expectedResponse = Util.GetMockData<SystemUserFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/{partyId}/{systemUserId}");
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
            int partyId = 51329012;
            string systemUserId = "e60073ad-c661-4ca0-b74c-40238ad333e9";
            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/{partyId}/{systemUserId}");

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
            int partyId = 51329012;
            string systemUserId = "123e4567-e89b-12d3-a456-426614174000";
            HttpStatusCode expectedResponse = HttpStatusCode.Accepted;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/{partyId}/{systemUserId}");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: DeleteSystemUser checks that systems user with given id for given party is deleted
        ///     Expected: DeleteSystemUser deletes the system user with given id for given party
        /// </summary>
        [Fact]
        public async Task DeleteSystemUser_ReturnsNotFound()
        {
            // Arrange
            int partyId = 51329012;
            string systemUserId = "e60073ad-c661-4ca0-b74c-40238ad333e9";
            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/{partyId}/{systemUserId}");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: PostSystemUser creates new system user for given party
        ///     Expected: PostSystemUser new guid for created system user
        /// </summary>
        [Fact]
        public async Task PostSystemUser_ReturnsNewSystemUserId()
        {
            // Arrange
            int partyId = 51329012;
            string expectedResponse = "eb9c9edf-a32f-424c-b475-6d47a0e7621f";
            NewSystemUserRequest dto = new NewSystemUserRequest
            {
                IntegrationTitle = "Fiken",
                SystemId = "910493353_fiken_demo_product",
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/{partyId}", content);
            SystemUserCreateResponseFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<SystemUserCreateResponseFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.Id);
        }

        /// <summary>
        ///     Test case: PostSystemUser creates new system user for given party, for a system that does not exist
        ///     Expected: PostSystemUser returns specific error code
        /// </summary>
        [Fact]
        public async Task PostSystemUser_ReturnsSystemNotFound()
        {
            // Arrange
            int partyId = 51329012;
            string expectedResponse = "AMUI-00011";
            NewSystemUserRequest dto = new NewSystemUserRequest
            {
                IntegrationTitle = "NotFound",
                SystemId = "not_found",
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/{partyId}", content);
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: GetAgentSystemUsers checks that all agent systems users for given party are returned
        ///     Expected: GetAgentSystemUsers returns the agent system users for given party
        /// </summary>
        [Fact]
        public async Task GetAgentSystemUsers_ReturnsAllAgentSystemUsersNewestFirst()
        {
            // Arrange
            int partyId = 51329012;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "agentSystemUsers.json");
            List<SystemUserFE> expectedResponse = Util.GetMockData<List<SystemUserFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agent/{partyId}");
            List<SystemUserFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<SystemUserFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetAgentSystemUser checks that agent systems user with given id for given party is returned
        ///     Expected: GetAgentSystemUser returns the agent system user with given id for given party
        /// </summary>
        [Fact]
        public async Task GetAgentSystemUser_ReturnsAgentSystemUser()
        {
            // Arrange
            int partyId = 51329012;
            string systemUserId = "61844188-3789-4b84-9314-2be1fdbc6633";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "agentSystemUser.json");
            SystemUserFE expectedResponse = Util.GetMockData<SystemUserFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agent/{partyId}/{systemUserId}");
            SystemUserFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<SystemUserFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetAgentSystemUser checks that agent system user with given id for given party is not returned
        ///     Expected: GetAgentSystemUser returns NotFound for the agent system user with given id for given party
        /// </summary>
        [Fact]
        public async Task GetAgentSystemUser_ReturnsNotFound()
        {
            // Arrange
            int partyId = 51329012;
            string systemUserId = "e60073ad-c661-4ca0-b74c-40238ad333e9";
            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agent/{partyId}/{systemUserId}");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: DeleteAgentSystemUser checks that agent system user with given id for given party is deleted
        ///     Expected: DeleteAgentSystemUser deletes the agent system user with given id for given party
        /// </summary>
        [Fact]
        public async Task DeleteAgentSystemUser_ReturnsAccepted()
        {
            // Arrange
            int partyId = 51329012;
            string systemUserId = "61844188-3789-4b84-9314-2be1fdbc6633";
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            HttpStatusCode expectedResponse = HttpStatusCode.Accepted;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/agent/{partyId}/{systemUserId}?partyuuid={partyUuid}");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: DeleteAgentSystemUser checks that agent system user with given id for given party is not deleted when it is not found
        ///     Expected: DeleteAgentSystemUser returns not found
        /// </summary>
        [Fact]
        public async Task DeleteAgentSystemUser_ReturnsNotFound()
        {
            // Arrange
            int partyId = 51329012;
            string systemUserId = "e60073ad-c661-4ca0-b74c-40238ad333e9";
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/agent/{partyId}/{systemUserId}?partyuuid={partyUuid}");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }
    }
}