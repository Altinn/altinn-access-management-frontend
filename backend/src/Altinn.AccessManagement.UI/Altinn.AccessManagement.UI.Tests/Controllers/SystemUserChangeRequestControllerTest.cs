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
    ///     Test class for <see cref="SystemUserChangeRequestControllerTest"></see>
    /// </summary>
    [Collection("SystemUserChangeRequestControllerTest")]
    public class SystemUserChangeRequestControllerTest : IClassFixture<CustomWebApplicationFactory<SystemUserChangeRequestController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SystemUserChangeRequestControllerTest(CustomWebApplicationFactory<SystemUserChangeRequestController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetSystemUserChangeRequest checks that the system user change request is returned
        ///     Expected: GetSystemUserChangeRequest returns the system user change request
        /// </summary>
        [Fact]
        public async Task GetSystemUserChangeRequest_ReturnsRequest()
        {
            // Arrange
            int partyId = 51329012;
            string changeRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUserChangeRequest.json");
            SystemUserChangeRequestFE expectedResponse = Util.GetMockData<SystemUserChangeRequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/changerequest/{partyId}/{changeRequestId}");
            SystemUserChangeRequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<SystemUserChangeRequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetSystemUserChangeRequest checks that an error is returned when system user change request is not found
        ///     Expected: GetSystemUserChangeRequest returns the error
        /// </summary>
        [Fact]
        public async Task GetSystemUserChangeRequest_ReturnsError()
        {
            // Arrange
            int partyId = 51329012;
            string changeRequestId = "e71a293a-3e7b-42f4-9315-81aa8c2515e5";
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/changerequest/{partyId}/{changeRequestId}");
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: ApproveSystemUserChangeRequest checks that the system user change request is approved
        ///     Expected: ApproveSystemUserChangeRequest returns true
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserChangeRequest_ApproveOk()
        {
            // Arrange
            int partyId = 51329012;
            string changeRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/changerequest/{partyId}/{changeRequestId}/approve", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: ApproveSystemUserChangeRequest checks that an error is returned when system user change request is not found
        ///     Expected: ApproveSystemUserChangeRequest returns the error
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserChangeRequest_ReturnsError()
        {
            // Arrange
            int partyId = 51329012;
            string changeRequestId = "e71a293a-3e7b-42f4-9315-81aa8c2515e5";
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/changerequest/{partyId}/{changeRequestId}/approve", null);
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: RejectSystemUserChangeRequest checks that the system user change request is rejected
        ///     Expected: RejectSystemUserChangeRequest returns true
        /// </summary>
        [Fact]
        public async Task RejectSystemUserChangeRequest_RejectOk()
        {
            // Arrange
            int partyId = 51329012;
            string changeRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/changerequest/{partyId}/{changeRequestId}/reject", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: RejectSystemUserChangeRequest checks that an error is returned when system user change request is not found
        ///     Expected: RejectSystemUserChangeRequest returns the error
        /// </summary>
        [Fact]
        public async Task RejectSystemUserChangeRequest_ReturnsError()
        {
            // Arrange
            int partyId = 51329012;
            string changeRequestId = "e71a293a-3e7b-42f4-9315-81aa8c2515e5";
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/changerequest/{partyId}/{changeRequestId}/reject", null);
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: Logout checks that redirect to logout url is called
        ///     Expected: Logout asserts that the location is to the logout url
        /// </summary>
        [Fact]
        public async Task Logout_RedirectsToLogoutUrl()
        {
            // Arrange
            string changeRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            string expectedResponseUrl = "http://localhost:5101/authentication/api/v1/logout";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/changerequest/{changeRequestId}/logout");

            // Assert
            Assert.Equal(HttpStatusCode.Redirect, httpResponse.StatusCode);
            if (httpResponse.Headers.TryGetValues("location", out IEnumerable<string> values))
            {
                Assert.Equal(expectedResponseUrl, values.First());
            }
        }
    }
}