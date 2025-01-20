using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="SystemUserRequestControllerTest"></see>
    /// </summary>
    [Collection("SystemUserRequestControllerTest")]
    public class SystemUserRequestControllerTest : IClassFixture<CustomWebApplicationFactory<SystemUserRequestController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SystemUserRequestControllerTest(CustomWebApplicationFactory<SystemUserRequestController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetSystemUserRequest checks that the system user request is returned
        ///     Expected: GetSystemUserRequest returns the system user request
        /// </summary>
        [Fact]
        public async Task GetSystemUserRequest_ReturnsRequest()
        {
            // Arrange
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUserRequest.json");
            SystemUserRequestFE expectedResponse = Util.GetMockData<SystemUserRequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/request/51329012/24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3");
            SystemUserRequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<SystemUserRequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: ApproveSystemUserRequest checks that the system user request is approved
        ///     Expected: ApproveSystemUserRequest returns true
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserRequest_ApproveOk()
        {
            // Arrange
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUserRequest.json");
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/request/51329012/24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3/approve", null);
            bool actualResponse = true;

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: ApproveSystemUserRequest checks that the system user request is rejected
        ///     Expected: ApproveSystemUserRequest returns true
        /// </summary>
        [Fact]
        public async Task RejectSystemUserRequest_ApproveOk()
        {
            // Arrange
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUserRequest.json");
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/request/51329012/24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3/reject", null);
            bool actualResponse = true;

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }
    }
}