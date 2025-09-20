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
        private readonly string ORG_CONSENT_WITHOUT_MESSAGE_ID = "1a04a7fa-24c1-4e06-9217-8aee89239a9f";

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
        ///     Test case: GetConsentRequest checks that consent request with expected texts is returned
        ///     Expected: GetConsentRequest returns the consent request
        /// </summary>
        [Fact]
        public async Task GetConsentRequest_ReturnsConsentRequestForOrgWithoutMessage()
        {
            // Arrange
            string requestId = ORG_CONSENT_WITHOUT_MESSAGE_ID;
            string path = Path.Combine(_expectedDataPath, "Consent", "consentRequest_org_without_message.json");
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

        /// <summary>
        ///     Test case: GetActiveConsents checks that active consents are returned
        ///     Expected: GetActiveConsents returns active consents
        /// </summary>
        [Fact]
        public async Task GetActiveConsents_ReturnsConsents()
        {
            // Arrange
            string party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string path = Path.Combine(_expectedDataPath, "Consent", "activeConsents_org.json");
            List<ActiveConsentItemFE> expectedResponse = Util.GetMockData<List<ActiveConsentItemFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/active/{party}");
            List<ActiveConsentItemFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ActiveConsentItemFE>>();

            // Assert
            AssertionUtil.AssertCollections(actualResponse, expectedResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetConsentLog checks that consent log is returned
        ///     Expected: GetConsentLog returns consent log
        /// </summary>
        [Fact]
        public async Task GetConsentLog_ReturnsConsents()
        {
            // Arrange
            string party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string path = Path.Combine(_expectedDataPath, "Consent", "consentLog_org.json");
            List<ConsentLogItemFE> expectedResponse = Util.GetMockData<List<ConsentLogItemFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/log/{party}");
            List<ConsentLogItemFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ConsentLogItemFE>>();

            // Assert
            AssertionUtil.AssertCollections(actualResponse, expectedResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetActiveConsents checks that error is returned if party is invalid
        ///     Expected: GetActiveConsents returns error
        /// </summary>
        [Fact]
        public async Task GetActiveConsents_ReturnsError()
        {
            // Arrange
            string party = "477717d1-d9b2-40f0-98c7-0fd8eb0626c2";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/active/{party}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: GetConsent checks that consent is returned
        ///     Expected: GetConsent returns consent
        /// </summary>
        [Fact]
        public async Task GetConsent_ReturnsConsent()
        {
            // Arrange
            string consentId = "75af4b32-231b-4317-b31a-5e0c71a0bb64";
            string path = Path.Combine(_expectedDataPath, "Consent", "consent_org.json");
            ConsentFE expectedResponse = Util.GetMockData<ConsentFE>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/{consentId}");
            ConsentFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<ConsentFE>();

            // Assert
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: GetConsent checks that error is returned when consent is not found
        ///     Expected: GetConsent returns error
        /// </summary>
        [Fact]
        public async Task GetConsent_ReturnsError()
        {
            // Arrange
            string consentId = "4b3758b1-48d7-4d13-beb7-84898443bcac";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/consent/{consentId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: RevokeConsent checks consent is revoked
        ///     Expected: RevokeConsent returns ok
        /// </summary>
        [Fact]
        public async Task RevokeConsent_ReturnsOk()
        {
            // Arrange
            string consentId = "75af4b32-231b-4317-b31a-5e0c71a0bb64";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/consent/{consentId}/revoke", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }
        
        /// <summary>
        ///     Test case: RevokeConsent checks error is returned when consent is not found
        ///     Expected: RevokeConsent returns not found
        /// </summary>
        [Fact]
        public async Task RevokeConsent_ReturnsNotFound()
        {
            // Arrange
            string consentId = "16986eaf-c2bf-41c6-b2df-dc72a8c501ce";

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/consent/{consentId}/revoke", null);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }
    }
}