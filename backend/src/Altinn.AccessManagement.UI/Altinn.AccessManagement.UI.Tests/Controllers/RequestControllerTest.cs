using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Request.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="RequestControllerTest"></see>
    /// </summary>
    [Collection("RequestControllerTest")]
    public class RequestControllerTest : IClassFixture<CustomWebApplicationFactory<RequestController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public RequestControllerTest(CustomWebApplicationFactory<RequestController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetSentRequests returns sent requests for party
        ///     Expected: GetSentRequests returns the requests sent by a party
        /// </summary>
        [Fact]
        public async Task GetSentRequests_ReturnsRequestsForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getSentRequests.json");
            IEnumerable<SingleRightRequest> expectedResponse = Util.GetMockData<IEnumerable<SingleRightRequest>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}&to={toParty}");
            IEnumerable<SingleRightRequest> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<SingleRightRequest>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetReceivedRequests returns received requests for party
        ///     Expected: GetReceivedRequests returns the requests received by a party
        /// </summary>
        [Fact]
        public async Task GetReceivedRequests_ReturnsRequestsForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string fromParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getReceivedRequests.json");
            IEnumerable<SingleRightRequest> expectedResponse = Util.GetMockData<IEnumerable<SingleRightRequest>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received?party={party}&from={fromParty}");
            IEnumerable<SingleRightRequest> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<SingleRightRequest>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetRequest returns a single request by id
        ///     Expected: GetRequest returns the correct request
        /// </summary>
        [Fact]
        public async Task GetRequest_ReturnsSingleRequest()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";
            string path = Path.Combine(_expectedDataPath, "Request", "getRequest.json");
            SingleRightRequest expectedResponse = Util.GetMockData<SingleRightRequest>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/{requestId}?party={party}");
            SingleRightRequest actualResponse = await httpResponse.Content.ReadFromJsonAsync<SingleRightRequest>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: CreateResourceRequest creates a resource request
        ///     Expected: CreateResourceRequest returns true
        /// </summary>
        [Fact]
        public async Task CreateResourceRequest_ReturnsTrue()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string resourceId = "1337";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/resource?party={party}&to={toParty}&resource={resourceId}", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.True(actualResponse);
        }

        /// <summary>
        ///     Test case: WithdrawRequest withdraws a request
        ///     Expected: WithdrawRequest returns true
        /// </summary>
        [Fact]
        public async Task WithdrawRequest_ReturnsTrue()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/request/sent/withdraw?party={party}&id={requestId}", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.True(actualResponse);
        }

        /// <summary>
        ///     Test case: GetSentRequests encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetSentRequests_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetSentRequests encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetSentRequests_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetReceivedRequests encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetReceivedRequests_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetReceivedRequests encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetReceivedRequests_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetRequest_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/{requestId}?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetRequest_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/{requestId}?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: CreateResourceRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task CreateResourceRequest_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string resourceId = "1337";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/resource?party={party}&to={toParty}&resource={resourceId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: CreateResourceRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task CreateResourceRequest_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string resourceId = "1337";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/resource?party={party}&to={toParty}&resource={resourceId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: WithdrawRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task WithdrawRequest_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/request/sent/withdraw?party={party}&id={requestId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: WithdrawRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task WithdrawRequest_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/request/sent/withdraw?party={party}&id={requestId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }
    }
}