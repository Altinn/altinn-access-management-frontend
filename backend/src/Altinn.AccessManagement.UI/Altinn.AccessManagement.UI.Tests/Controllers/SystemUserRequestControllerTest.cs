using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Altinn.Authorization.ProblemDetails;

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
        ///     Test case: GetSystemUserRequest checks that an error is returned when system user request is not found
        ///     Expected: GetSystemUserRequest returns the error
        /// </summary>
        [Fact]
        public async Task GetSystemUserRequest_ReturnsError()
        {
            // Arrange
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/request/51329012/e71a293a-3e7b-42f4-9315-81aa8c2515e5");
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: ApproveSystemUserRequest checks that the system user request is approved
        ///     Expected: ApproveSystemUserRequest returns true
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserRequest_ApproveOk()
        {
            // Arrange
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/request/51329012/24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3/approve", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: ApproveSystemUserRequest checks that an error is returned when system user request is not found
        ///     Expected: ApproveSystemUserRequest returns the error
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserRequest_ReturnsError()
        {
            // Arrange
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/request/51329012/e71a293a-3e7b-42f4-9315-81aa8c2515e5/approve", null);
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: RejectSystemUserRequest checks that the system user request is rejected
        ///     Expected: RejectSystemUserRequest returns true
        /// </summary>
        [Fact]
        public async Task RejectSystemUserRequest_ApproveOk()
        {
            // Arrange
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/request/51329012/24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3/reject", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: RejectSystemUserRequest checks that an error is returned when system user request is not found
        ///     Expected: RejectSystemUserRequest returns the error
        /// </summary>
        [Fact]
        public async Task RejectSystemUserRequest_ReturnsError()
        {
            // Arrange
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/request/51329012/e71a293a-3e7b-42f4-9315-81aa8c2515e5/reject", null);
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: RejectSystemUserRequest checks that an error is returned when system user request is not found
        ///     Expected: RejectSystemUserRequest returns the error
        /// </summary>
        [Fact]
        public async Task Logout_RedirectsToLogoutUrl()
        {
            // Arrange
            string expectedResponseUrl = "http://localhost:5101/authentication/api/v1/logout";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/request/24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3/logout");

            // Assert
            Assert.Equal(HttpStatusCode.Redirect, httpResponse.StatusCode);
            if (httpResponse.Headers.TryGetValues("location", out IEnumerable<string> values))
            {
                Assert.Equal(expectedResponseUrl, values.First());
            }
        }
    }
}