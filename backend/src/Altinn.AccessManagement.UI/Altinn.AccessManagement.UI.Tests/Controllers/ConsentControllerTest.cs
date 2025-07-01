using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Consent;
using Altinn.AccessManagement.UI.Core.Models.Consent.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="ConsentController"></see>
    /// </summary>
    [Collection("ConsentControllerTest")]
    public class ConsentControllerTest : IClassFixture<CustomWebApplicationFactory<ConsentController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        private readonly string PERSON_CONSENT_ID = "e2071c55-6adf-487b-af05-9198a230ed44";
        private readonly string ORG_CONSENT_ID = "7e540335-d82f-41e9-8b8f-619336d792b4";

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
        public async Task GetConsentRequest_ReturnsConsentRequestForPerson()
        {
            // Arrange
            string requestId = PERSON_CONSENT_ID;
            string path = Path.Combine(_expectedDataPath, "Consent", "consentRequest_person.json");
            ConsentRequestFE expectedResponse = Util.GetMockData<ConsentRequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/request/{requestId}");
            ConsentRequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<ConsentRequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetConsentRequest checks that consent request with expected texts is returned
        ///     Expected: GetConsentRequest returns the consent request
        /// </summary>
        [Fact]
        public async Task GetConsentRequest_ReturnsConsentRequestForOrg()
        {
            // Arrange
            string requestId = ORG_CONSENT_ID;
            string path = Path.Combine(_expectedDataPath, "Consent", "consentRequest_org.json");
            ConsentRequestFE expectedResponse = Util.GetMockData<ConsentRequestFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/request/{requestId}");       
            ConsentRequestFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<ConsentRequestFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetConsentRequest checks that error is returned when consent is not found
        ///     Expected: GetConsentRequest returns error
        /// </summary>
        [Fact]
        public async Task GetConsentRequest_ReturnsError()
        {
            // Arrange
            string requestId = "602445ee-3cdd-462d-aeb9-e74c7bfd89ad";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/request/{requestId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: RejectConsentRequest checks that consent request is rejected
        ///     Expected: RejectConsentRequest returns true when consent request is rejected
        /// </summary>
        [Fact]
        public async Task RejectConsentRequest_ReturnsOk()
        {
            // Arrange
            string requestId = PERSON_CONSENT_ID;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/consent/request/{requestId}/reject", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: RejectConsentRequest checks that error is returned when consent cannot be rejected
        ///     Expected: RejectConsentRequest returns error
        /// </summary>
        [Fact]
        public async Task RejectConsentRequest_ReturnsError()
        {
            // Arrange
            string requestId = "602445ee-3cdd-462d-aeb9-e74c7bfd89ad";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/consent/request/{requestId}/reject", null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: ApproveConsentRequest checks that consent request is approved
        ///     Expected: ApproveConsentRequest returns true when consent request is approved
        /// </summary>
        [Fact]
        public async Task ApproveConsentRequest_ReturnsOk()
        {
            // Arrange
            string requestId = PERSON_CONSENT_ID;
            ApproveConsentContext dto = new()
            {
                Language = "nb"
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/consent/request/{requestId}/approve", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: ApproveConsentRequest checks that error is returned when consent cannot be rejected
        ///     Expected: ApproveConsentRequest returns error
        /// </summary>
        [Fact]
        public async Task ApproveConsentRequestReturnsError()
        {
            // Arrange
            string requestId = "602445ee-3cdd-462d-aeb9-e74c7bfd89ad";
            ApproveConsentContext dto = new()
            {
                Language = "nb"
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/consent/request/{requestId}/approve", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: RedirectAfterApprove checks that redirect is done to logout url
        ///     Expected: RedirectAfterApprove redirects to logout url
        /// </summary>
        [Fact]
        public async Task LogoutAfterApprove_RedirectsToLogoutUrl()
        {
            // Arrange
            string expectedRedirectUrl = "http://localhost:5101/authentication/api/v1/logout";
            string requestId = PERSON_CONSENT_ID;

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/request/{requestId}/logout");

            // Assert
            Assert.Equal(HttpStatusCode.Found, httpResponse.StatusCode);
            Assert.Equal(expectedRedirectUrl, httpResponse.Headers.Location.OriginalString);
        }
    }
}