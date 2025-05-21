using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="ConsentControllerTest"></see>
    /// </summary>
    [Collection("ConsentControllerTest")]
    public class ConsentControllerTest : IClassFixture<CustomWebApplicationFactory<ConsentController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ConsentControllerTest(CustomWebApplicationFactory<ConsentController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetConsentRequest checks that consent request with expected texts is returned
        ///     Expected: GetConsentRequest returns the consent request
        /// </summary>
        [Fact]
        public async Task GetConsentRequest_ReturnsConsentRequest()
        {
            // Arrange
            string requestId = "e2071c55-6adf-487b-af05-9198a230ed44";
            string path = Path.Combine(_expectedDataPath, "Consent", "consentRequest.json");
            ConsentRequestFE expectedResponse = Util.GetMockData<ConsentRequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/{requestId}");
            string response = await httpResponse.Content.ReadAsStringAsync();
            ConsentRequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<ConsentRequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }
    }
}