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
        ///     Test case: GetSingleRightRequests checks that all relevant requests are returned
        ///     Expected: GetSingleRightRequests returns the requests for party
        /// </summary>
        [Fact]
        public async Task GetSingleRightRequests_ReturnsRequestsForParty()
        {
            // Arrange
            string toParty = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string fromParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string path = Path.Combine(_expectedDataPath, "Request", "getSingleRightRequests.json");
            IEnumerable<SingleRightRequest> expectedResponse = Util.GetMockData<IEnumerable<SingleRightRequest>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/request?party={toParty}&from={fromParty}&to={toParty}");
            IEnumerable<SingleRightRequest> actualResponse = await httpResponse.Content.ReadFromJsonAsync<IEnumerable<SingleRightRequest>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse.ToList(), actualResponse.ToList(), AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: CreateSingleRightRequest checks single right request is created
        ///     Expected: CreateSingleRightRequest returns true
        /// </summary>
        [Fact]
        public async Task CreateSingleRightRequest_ReturnsTrue()
        {
            // Arrange
            string toParty = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
            string fromParty = "feb51634-0042-4ab0-a9db-8705300141a6";
            string resourceId = "1337";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/request?party={toParty}&to={toParty}&from={fromParty}&resource={resourceId}", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.True(actualResponse);
        }

        /// <summary>
        ///     Test case: WithdrawSingleRightRequest_ReturnsTrue checks single right request is withdrawn
        ///     Expected: WithdrawSingleRightRequest_ReturnsTrue returns true
        /// </summary>
        [Fact]
        public async Task WithdrawSingleRightRequest_ReturnsTrue()
        {
            // Arrange
            string requestId = "da45b77b-a068-4d53-b6be-0837cc9c5a3f";

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/request?id={requestId}");
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.True(actualResponse);
        }
    }
}