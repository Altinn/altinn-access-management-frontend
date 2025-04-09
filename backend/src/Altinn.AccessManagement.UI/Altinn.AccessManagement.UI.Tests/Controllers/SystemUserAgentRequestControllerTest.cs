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
    ///     Test class for <see cref="SystemUserAgentRequestControllerTest"></see>
    /// </summary>
    [Collection("SystemUserAgentRequestControllerTest")]
    public class SystemUserAgentRequestControllerTest : IClassFixture<CustomWebApplicationFactory<SystemUserAgentRequestController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SystemUserAgentRequestControllerTest(CustomWebApplicationFactory<SystemUserAgentRequestController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetSystemUserAgentRequest checks that the system user change request is returned
        ///     Expected: GetSystemUserAgentRequest returns the system user change request
        /// </summary>
        [Fact]
        public async Task GetSystemUserAgentRequest_ReturnsRequest()
        {
            // Arrange
            Guid partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string agentRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "systemUserAgentRequest.json");
            SystemUserAgentRequestFE expectedResponse = Util.GetMockData<SystemUserAgentRequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentrequest/{partyId}/{agentRequestId}");
            SystemUserAgentRequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<SystemUserAgentRequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetSystemUserAgentRequest checks that an error is returned when system user change request is not found
        ///     Expected: GetSystemUserAgentRequest returns the error
        /// </summary>
        [Fact]
        public async Task GetSystemUserAgentRequest_ReturnsError()
        {
            // Arrange
            Guid partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string agentRequestId = "e71a293a-3e7b-42f4-9315-81aa8c2515e5";
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentrequest/{partyId}/{agentRequestId}");
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: ApproveSystemUserAgentRequest checks that the system user change request is approved
        ///     Expected: ApproveSystemUserAgentRequest returns true
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserAgentRequest_ApproveOk()
        {
            // Arrange
            Guid partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string agentRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/agentrequest/{partyId}/{agentRequestId}/approve", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: ApproveSystemUserAgentRequest checks that an error is returned when system user change request is not found
        ///     Expected: ApproveSystemUserAgentRequest returns the error
        /// </summary>
        [Fact]
        public async Task ApproveSystemUserAgentRequest_ReturnsError()
        {
            // Arrange
            Guid partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string agentRequestId = "e71a293a-3e7b-42f4-9315-81aa8c2515e5";
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/agentrequest/{partyId}/{agentRequestId}/approve", null);
            AltinnProblemDetails actualResponse = await httpResponse.Content.ReadFromJsonAsync<AltinnProblemDetails>();

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse.ErrorCode.ToString());
        }

        /// <summary>
        ///     Test case: RejectSystemUserAgentRequest checks that the system user change request is rejected
        ///     Expected: RejectSystemUserAgentRequest returns true
        /// </summary>
        [Fact]
        public async Task RejectSystemUserAgentRequest_RejectOk()
        {
            // Arrange
            Guid partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string agentRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/agentrequest/{partyId}/{agentRequestId}/reject", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: RejectSystemUserAgentRequest checks that an error is returned when system user change request is not found
        ///     Expected: RejectSystemUserAgentRequest returns the error
        /// </summary>
        [Fact]
        public async Task RejectSystemUserAgentRequest_ReturnsError()
        {
            // Arrange
            Guid partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string agentRequestId = "e71a293a-3e7b-42f4-9315-81aa8c2515e5";
            string expectedResponse = "AUTH-00010";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/agentrequest/{partyId}/{agentRequestId}/reject", null);
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
            string agentRequestId = "24c092ab-7ff0-4d13-8ab8-7dad51ca7ad3";
            string expectedResponseUrl = "http://localhost:5101/authentication/api/v1/logout";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentrequest/{agentRequestId}/logout");

            // Assert
            Assert.Equal(HttpStatusCode.Redirect, httpResponse.StatusCode);
            if (httpResponse.Headers.TryGetValues("location", out IEnumerable<string> values))
            {
                Assert.Equal(expectedResponseUrl, values.First());
            }
        }
    }
}