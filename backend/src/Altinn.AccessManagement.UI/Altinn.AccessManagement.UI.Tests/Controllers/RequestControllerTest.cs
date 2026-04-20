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
            IEnumerable<RequestFE> expectedResponse = Util.GetMockData<IEnumerable<RequestFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}&to={toParty}");
            IEnumerable<RequestFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<RequestFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentResourceRequests returns sent requests for party with resource data included
        ///     Expected: GetEnrichedSentResourceRequests returns the requests sent by a party with resource data included
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentResourceRequests_ReturnsRequestsForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getEnrichedSentResourceRequests.json");
            IEnumerable<EnrichedResourceRequest> expectedResponse = Util.GetMockData<IEnumerable<EnrichedResourceRequest>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/resource?party={party}&to={toParty}");
            IEnumerable<EnrichedResourceRequest> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<EnrichedResourceRequest>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentResourceRequests encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentResourceRequests_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/resource?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentResourceRequests encounters an HttpStatusException
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentResourceRequests_HttpStatusException()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/resource?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentResourceRequests encounters an NotFoundException due to invalid resource reference in request
        ///     Expected: Returns 404 Not Found
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentResourceRequests_NotFoundException()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "22222222-2222-2222-2222-222222222222";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/resource?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
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
            IEnumerable<RequestFE> expectedResponse = Util.GetMockData<IEnumerable<RequestFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received?party={party}&from={fromParty}");
            IEnumerable<RequestFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<RequestFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedResourceRequests returns received requests for party with resource data included
        ///     Expected: GetEnrichedReceivedResourceRequests returns the requests received by a party with resource data included
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedResourceRequests_ReturnsRequestsForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string fromParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getEnrichedReceivedResourceRequests.json");
            IEnumerable<EnrichedResourceRequest> expectedResponse = Util.GetMockData<IEnumerable<EnrichedResourceRequest>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/resource?party={party}&from={fromParty}");
            IEnumerable<EnrichedResourceRequest> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<EnrichedResourceRequest>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedResourceRequests encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedResourceRequests_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/resource?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedResourceRequests encounters an HttpStatusException
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedResourceRequests_HttpStatusException()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/resource?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedResourceRequests encounters a NotFoundException due to invalid resource reference in request
        ///     Expected: Returns 404 Not Found
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedResourceRequests_NotFoundException()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "22222222-2222-2222-2222-222222222222";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/resource?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentPackageRequests returns sent package requests for party with package data included
        ///     Expected: GetEnrichedSentPackageRequests returns the requests sent by a party with package data included
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentPackageRequests_ReturnsRequestsForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getEnrichedSentPackageRequests.json");
            IEnumerable<EnrichedPackageRequest> expectedResponse = Util.GetMockData<IEnumerable<EnrichedPackageRequest>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/package?party={party}&to={toParty}");
            IEnumerable<EnrichedPackageRequest> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<EnrichedPackageRequest>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentPackageRequests encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentPackageRequests_InternalServerError()
        {
            // Arrange
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/package?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentPackageRequests encounters an HttpStatusException
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentPackageRequests_HttpStatusException()
        {
            // Arrange
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/package?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedSentPackageRequests encounters a NotFoundException due to invalid package reference in request
        ///     Expected: Returns 404 Not Found
        /// </summary>
        [Fact]
        public async Task GetEnrichedSentPackageRequests_NotFoundException()
        {
            // Arrange
            string party = "22222222-2222-2222-2222-222222222222";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/package?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedPackageRequests returns received package requests for party with package data included
        ///     Expected: GetEnrichedReceivedPackageRequests returns the requests received by a party with package data included
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedPackageRequests_ReturnsRequestsForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string fromParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getEnrichedReceivedPackageRequests.json");
            IEnumerable<EnrichedPackageRequest> expectedResponse = Util.GetMockData<IEnumerable<EnrichedPackageRequest>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/package?party={party}&from={fromParty}");
            IEnumerable<EnrichedPackageRequest> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<EnrichedPackageRequest>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedPackageRequests encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedPackageRequests_InternalServerError()
        {
            // Arrange
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/package?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedPackageRequests encounters an HttpStatusException
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedPackageRequests_HttpStatusException()
        {
            // Arrange
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/package?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetEnrichedReceivedPackageRequests encounters a NotFoundException due to invalid package reference in request
        ///     Expected: Returns 404 Not Found
        /// </summary>
        [Fact]
        public async Task GetEnrichedReceivedPackageRequests_NotFoundException()
        {
            // Arrange
            string party = "22222222-2222-2222-2222-222222222222";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/package?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
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
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/{requestId}?party={party}");
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetDraftRequest returns a single draft request by id
        ///     Expected: GetDraftRequest returns the correct draft request
        /// </summary>
        [Fact]
        public async Task GetDraftRequest_ReturnsSingleDraftRequest()
        {
            // Arrange
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";
            string path = Path.Combine(_expectedDataPath, "Request", "getEnrichedDraftRequest.json");
            EnrichedResourceRequest expectedResponse = Util.GetMockData<EnrichedResourceRequest>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/draft/{requestId}");
            EnrichedResourceRequest actualResponse = await httpResponse.Content.ReadFromJsonAsync<EnrichedResourceRequest>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetDraftRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetDraftRequest_InternalServerError()
        {
            // Arrange
            string requestId = "00000000-0000-0000-0000-000000000000"; // This ID triggers an internal error in the mock

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/draft/{requestId}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetDraftRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetDraftRequest_HttpStatusException()
        {
            // Arrange
            string requestId = "11111111-1111-1111-1111-111111111111"; // This ID triggers an HttpStatusException in the mock

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/draft/{requestId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetDraftRequest encounters a NotFoundException from the backend
        ///     Expected: Returns the status code from the exception (NotFound)
        /// </summary>
        [Fact]
        public async Task GetDraftRequest_NotFoundException()
        {
            // Arrange
            string requestId = "22222222-2222-2222-2222-222222222222"; // This ID triggers a NotFoundException in the mock

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/draft/{requestId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: CreateResourceRequest creates a resource request
        ///     Expected: CreateResourceRequest returns request
        /// </summary>
        [Fact]
        public async Task CreateResourceRequest_ReturnsRequest()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string resourceId = "1337";
            string path = Path.Combine(_expectedDataPath, "Request", "getRequest.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/resource?party={party}&to={toParty}&resource={resourceId}", null);
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: CreatePackageRequest creates a package request
        ///     Expected: CreatePackageRequest returns a request where resourceId is null when a package is requested
        /// </summary>
        [Fact]
        public async Task CreatePackageRequest_ReturnsRequestWithNullResourceId()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string packageId = "urn:altinn:accesspackage:agriculture";
            string path = Path.Combine(_expectedDataPath, "Request", "getPackageRequest.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/package?party={party}&to={toParty}&package={packageId}", null);
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
            Assert.Null(actualResponse.ResourceId);
        }

        /// <summary>
        ///     Test case: CreateResourceRequest creates a resource request
        ///     Expected: CreateResourceRequest returns a request where packageId is null when a resource is requested
        /// </summary>
        [Fact]
        public async Task CreateResourceRequest_ReturnsRequestWithNullPackageId()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string resourceId = "1337";
            string path = Path.Combine(_expectedDataPath, "Request", "getRequest.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/resource?party={party}&to={toParty}&resource={resourceId}", null);
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
            Assert.Null(actualResponse.PackageId);
        }

        /// <summary>
        ///     Test case: WithdrawRequest withdraws a request
        ///     Expected: WithdrawRequest returns request
        /// </summary>
        [Fact]
        public async Task WithdrawRequest_ReturnsRequest()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";
            string path = Path.Combine(_expectedDataPath, "Request", "getRequest.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/request/sent/withdraw?party={party}&id={requestId}");
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetSentRequestsCount returns count for party
        ///     Expected: GetSentRequestsCount returns an integer count
        /// </summary>
        [Fact]
        public async Task GetSentRequestsCount_ReturnsCountForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/count?party={party}&status=Pending");
            int actualResponse = await httpResponse.Content.ReadFromJsonAsync<int>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, actualResponse);
        }

        /// <summary>
        ///     Test case: GetSentRequestsCount encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetSentRequestsCount_InternalServerError()
        {
            // Arrange
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/count?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetSentRequestsCount encounters an HttpStatusException
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetSentRequestsCount_HttpStatusException()
        {
            // Arrange
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent/count?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetReceivedRequestsCount returns count for party
        ///     Expected: GetReceivedRequestsCount returns an integer count
        /// </summary>
        [Fact]
        public async Task GetReceivedRequestsCount_ReturnsCountForParty()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/count?party={party}&status=Pending");
            int actualResponse = await httpResponse.Content.ReadFromJsonAsync<int>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, actualResponse);
        }

        /// <summary>
        ///     Test case: GetReceivedRequestsCount encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetReceivedRequestsCount_InternalServerError()
        {
            // Arrange
            string party = "00000000-0000-0000-0000-000000000000";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/count?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetReceivedRequestsCount encounters an HttpStatusException
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task GetReceivedRequestsCount_HttpStatusException()
        {
            // Arrange
            string party = "11111111-1111-1111-1111-111111111111";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received/count?party={party}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
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
        ///     Test case: CreatePackageRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task CreatePackageRequest_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string packageId = "urn:altinn:accesspackage:agriculture";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/package?party={party}&to={toParty}&package={packageId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: CreatePackageRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task CreatePackageRequest_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string packageId = "urn:altinn:accesspackage:agriculture";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/package?party={party}&to={toParty}&package={packageId}", null);

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
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/request/sent/withdraw?party={party}&id={requestId}");

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
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/request/sent/withdraw?party={party}&id={requestId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: ConfirmRequest confirms a draft request
        ///     Expected: ConfirmRequest returns the request
        /// </summary>
        [Fact]
        public async Task ConfirmRequest_ReturnsRequest()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";
            string path = Path.Combine(_expectedDataPath, "Request", "getRequest.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/draft/confirm?party={party}&id={requestId}"));
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: ConfirmRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task ConfirmRequest_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/draft/confirm?party={party}&id={requestId}"));

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: ConfirmRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task ConfirmRequest_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/draft/confirm?party={party}&id={requestId}"));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: RejectRequest rejects a pending request
        ///     Expected: RejectRequest returns the request
        /// </summary>
        [Fact]
        public async Task RejectRequest_ReturnsRequest()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";
            string path = Path.Combine(_expectedDataPath, "Request", "getRequest.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/received/reject?party={party}&id={requestId}"));
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: RejectRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task RejectRequest_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/received/reject?party={party}&id={requestId}"));

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: RejectRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task RejectRequest_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/received/reject?party={party}&id={requestId}"));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: ApproveRequest approves a pending request
        ///     Expected: ApproveRequest returns the request
        /// </summary>
        [Fact]
        public async Task ApproveRequest_ReturnsRequest()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";
            string path = Path.Combine(_expectedDataPath, "Request", "getRequest.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/received/approve?party={party}&id={requestId}"));
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: ApproveRequest encounters an unexpected internal error
        ///     Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task ApproveRequest_InternalServerError()
        {
            // Arrange - Guid.Empty triggers ThrowExceptionIfTriggerParty in mock
            string party = "00000000-0000-0000-0000-000000000000";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/received/approve?party={party}&id={requestId}"));

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: ApproveRequest encounters an HttpStatusException from the backend
        ///     Expected: Returns the status code from the exception (BadRequest)
        /// </summary>
        [Fact]
        public async Task ApproveRequest_HttpStatusException()
        {
            // Arrange - Triggers ThrowHttpStatusExceptionIfTriggerParty in mock
            string party = "11111111-1111-1111-1111-111111111111";
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(new HttpRequestMessage(HttpMethod.Put, $"accessmanagement/api/v1/request/received/approve?party={party}&id={requestId}"));

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetSentRequests returns requests where the resource reference is null
        ///     Expected: GetSentRequests maps null resource to null resourceId in the FE model
        /// </summary>
        [Fact]
        public async Task GetSentRequests_NullResource_ReturnsNullResourceId()
        {
            // Arrange - 33333333 triggers null-resource mock data path
            string party = "33333333-3333-3333-3333-333333333333";
            string path = Path.Combine(_expectedDataPath, "Request", "getSentRequestsNullResource.json");
            IEnumerable<RequestFE> expectedResponse = Util.GetMockData<IEnumerable<RequestFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}");
            IEnumerable<RequestFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<RequestFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetSentRequests with type=package filter returns only package requests
        ///     Expected: GetSentRequests returns the requests filtered by type
        /// </summary>
        [Fact]
        public async Task GetSentRequests_WithPackageTypeFilter_ReturnsRequests()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getSentRequests.json");
            IEnumerable<RequestFE> expectedResponse = Util.GetMockData<IEnumerable<RequestFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}&to={toParty}&type=package");
            IEnumerable<RequestFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<RequestFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetSentRequests with type=resource filter returns only resource requests
        ///     Expected: GetSentRequests returns the requests filtered by type
        /// </summary>
        [Fact]
        public async Task GetSentRequests_WithResourceTypeFilter_ReturnsRequests()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getSentRequests.json");
            IEnumerable<RequestFE> expectedResponse = Util.GetMockData<IEnumerable<RequestFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}&to={toParty}&type=resource");
            IEnumerable<RequestFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<RequestFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetSentRequests with status=Pending filter returns pending requests
        ///     Expected: GetSentRequests returns only requests with status Pending
        /// </summary>
        [Fact]
        public async Task GetSentRequests_WithStatusFilter_ReturnsRequests()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getSentRequests.json");
            IEnumerable<RequestFE> expectedResponse = Util.GetMockData<IEnumerable<RequestFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/sent?party={party}&to={toParty}&status=Pending");
            IEnumerable<RequestFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<RequestFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetReceivedRequests with type=package filter returns only package requests
        ///     Expected: GetReceivedRequests returns the requests filtered by type
        /// </summary>
        [Fact]
        public async Task GetReceivedRequests_WithPackageTypeFilter_ReturnsRequests()
        {
            // Arrange
            string party = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string fromParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getReceivedRequests.json");
            IEnumerable<RequestFE> expectedResponse = Util.GetMockData<IEnumerable<RequestFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request/received?party={party}&from={fromParty}&type=package");
            IEnumerable<RequestFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<RequestFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: CreatePackageRequest returns a package request where the package reference is null
        ///     Expected: CreatePackageRequest maps null package to null packageId in the FE model
        /// </summary>
        [Fact]
        public async Task CreatePackageRequest_NullPackage_ReturnsNullPackageId()
        {
            // Arrange - 33333333 triggers null-package mock data path
            string party = "33333333-3333-3333-3333-333333333333";
            string toParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string packageId = "urn:altinn:accesspackage:agriculture";
            string path = Path.Combine(_expectedDataPath, "Request", "getPackageRequestNullPackage.json");
            RequestFE expectedResponse = Util.GetMockData<RequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request/package?party={party}&to={toParty}&package={packageId}", null);
            RequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<RequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }
    }
}
