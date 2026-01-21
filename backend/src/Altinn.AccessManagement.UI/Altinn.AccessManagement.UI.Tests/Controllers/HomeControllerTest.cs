using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Microsoft.AspNetCore.Http;
using Moq;
using System.Net;
using System.Net.Http.Headers;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="HomeController"></see>
    /// </summary>
    [Collection("HomeController Tests")]
    public class HomeControllerTest : IClassFixture<CustomWebApplicationFactory<HomeController>>
    {
        private readonly CustomWebApplicationFactory<HomeController> _factory;

        /// <summary>
        /// Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public HomeControllerTest(CustomWebApplicationFactory<HomeController> factory)
        {
            _factory = factory;
        }

        /// <summary>
        /// Test case: Checks if the altifirgery cookie is set when authenticated
        /// Expected: 
        /// </summary>
        [Fact]
        public async Task Index_Authenticated()
        {
            HttpClient client = SetupUtils.GetTestClient(_factory, false);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage response = await client.GetAsync($"accessmanagement/");
            IEnumerable<string> cookieHeaders = response.Headers.GetValues("Set-Cookie");
            IEnumerable<string> xframeHeaders = response.Headers.GetValues("X-Frame-Options");
            IEnumerable<string> contentTypeHeaders = response.Headers.GetValues("X-Content-Type-Options");
            IEnumerable<string> xxsProtectionHeaders = response.Headers.GetValues("X-XSS-Protection");
            IEnumerable<string> refererpolicyHeaders = response.Headers.GetValues("Referer-Policy");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(5, cookieHeaders.Count());
            Assert.StartsWith("AS-", cookieHeaders.ElementAt(0));
            Assert.StartsWith("XSR", cookieHeaders.ElementAt(1));
            Assert.StartsWith("selectedLanguage", cookieHeaders.ElementAt(2));
            Assert.StartsWith("AltinnPartyId", cookieHeaders.ElementAt(3));
            Assert.StartsWith("AltinnPartyUuid", cookieHeaders.ElementAt(4));
            Assert.StartsWith("deny", xframeHeaders.ElementAt(0));
            Assert.StartsWith("nosniff", contentTypeHeaders.ElementAt(0));
            Assert.StartsWith("0", xxsProtectionHeaders.ElementAt(0));
            Assert.StartsWith("no-referer", refererpolicyHeaders.ElementAt(0));
        }

        /// <summary>
        /// Test case: Checks if the user is redirected to authentication when not authenticated
        /// Expected: User is redirected to authentication
        /// </summary>
        [Fact]
        public async Task Index_NotAuthenticated()
        {
            // Arrange
            HttpClient client = SetupUtils.GetTestClient(_factory, true);
            string requestUrl = "http://localhost:5101/authentication/api/v1/authentication?goto=http%3a%2f%2flocalhost%3a5101%2faccessmanagement%2f%3fopenAccountMenu%3dtrue";

            // Act
            HttpResponseMessage response = await client.GetAsync($"accessmanagement/");

            // Assert
            Assert.Equal(requestUrl, response.RequestMessage.RequestUri.ToString());
        }

        /// <summary>
        /// Test case : Authenticate with a cookie
        /// Expected : User is authenticated
        /// </summary>
        /// <returns></returns>
        [Fact]
        public async Task GetHome_OK_WithAuthCookie()
        {
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");

            HttpClient client = SetupUtils.GetTestClient(_factory, false);

            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");
            SetupUtils.AddLanguageCookie(httpRequestMessage);

            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");

            HttpResponseMessage response = await client.SendAsync(httpRequestMessage);
            _ = await response.Content.ReadAsStringAsync();
            IEnumerable<string> cookieHeaders = response.Headers.GetValues("Set-Cookie");


            // Verify that 
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(5, cookieHeaders.Count());
            Assert.StartsWith("AS-", cookieHeaders.ElementAt(0));
            Assert.StartsWith("XSR", cookieHeaders.ElementAt(1));
            Assert.StartsWith("selectedLanguage", cookieHeaders.ElementAt(2));
            Assert.StartsWith("AltinnPartyId", cookieHeaders.ElementAt(3));
            Assert.StartsWith("AltinnPartyUuid", cookieHeaders.ElementAt(4));
        }


        /// <summary>
        /// Test case : Authenticate with a invalid cookie
        /// Expected : User is redirected to authentication
        /// </summary>
        /// <returns></returns>
        [Fact]
        public async Task GetHome_UnAuthorized_WithInvalidAuthCookie()
        {
            string token = "This is an invalid token";

            HttpClient client = SetupUtils.GetTestClient(_factory, true);
            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");

            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");

            HttpResponseMessage response = await client.SendAsync(httpRequestMessage);
            string requestUrl = "http://localhost:5101/authentication/api/v1/authentication?goto=http%3a%2f%2flocalhost%3a5101%2faccessmanagement%2f%3fopenAccountMenu%3dtrue";

            // Verify that 
            Assert.Equal(requestUrl, response.RequestMessage.RequestUri.ToString());
        }

        /// <summary>
        /// Test case: Both AltinnPartyId and AltinnPartyUuid cookies are present with valid values
        /// Expected: No new cookies are added or modified
        /// </summary>
        [Fact]
        public async Task Index_BothPartyCookiesPresent_NoCookiesAdded()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1234, 50005545);
            HttpClient client = SetupUtils.GetTestClient(_factory, false);

            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");
            SetupUtils.AddLanguageCookie(httpRequestMessage);
            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");
            httpRequestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Add both party cookies with valid values
            httpRequestMessage.Headers.Add("Cookie", "AltinnPartyId=50005545");
            httpRequestMessage.Headers.Add("Cookie", "AltinnPartyUuid=00000000-0000-0000-0005-000000005545");

            // Act
            HttpResponseMessage response = await client.SendAsync(httpRequestMessage);
            IEnumerable<string> cookieHeaders = response.Headers.GetValues("Set-Cookie");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(3, cookieHeaders.Count()); // Only XSR, selectedLanguage, and AS- cookies should be set
            Assert.Single(cookieHeaders, c => c.StartsWith("AS-"));
            Assert.Single(cookieHeaders, c => c.StartsWith("XSR"));
            Assert.Single(cookieHeaders, c => c.StartsWith("selectedLanguage"));
            // Verify that no AltinnPartyId or AltinnPartyUuid cookies are in the response
            Assert.DoesNotContain(cookieHeaders, c => c.StartsWith("AltinnPartyId"));
            Assert.DoesNotContain(cookieHeaders, c => c.StartsWith("AltinnPartyUuid"));
        }

        /// <summary>
        /// Test case: AltinnPartyId cookie is missing but AltinnPartyUuid is present
        /// Expected: AltinnPartyId cookie is created based on the provided AltinnPartyUuid
        /// </summary>
        [Fact]
        public async Task Index_PartyIdCookieMissing_PartyIdCookieCreated()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1234, 50005545);
            HttpClient client = SetupUtils.GetTestClient(_factory, false);

            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");
            SetupUtils.AddLanguageCookie(httpRequestMessage);
            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");
            httpRequestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Add only AltinnPartyUuid cookie
            httpRequestMessage.Headers.Add("Cookie", "AltinnPartyUuid=00000000-0000-0000-0005-000000005545");

            // Act
            HttpResponseMessage response = await client.SendAsync(httpRequestMessage);
            IEnumerable<string> cookieHeaders = response.Headers.GetValues("Set-Cookie");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(4, cookieHeaders.Count()); // XSR, selectedLanguage, AS-, and AltinnPartyId cookies
            Assert.Single(cookieHeaders, c => c.StartsWith("AS-"));
            Assert.Single(cookieHeaders, c => c.StartsWith("XSR"));
            Assert.Single(cookieHeaders, c => c.StartsWith("selectedLanguage"));
            Assert.Single(cookieHeaders, c => c.StartsWith("AltinnPartyId"));
            // Verify that no AltinnPartyUuid cookie is set (since it was already present)
            Assert.DoesNotContain(cookieHeaders, c => c.StartsWith("AltinnPartyUuid"));
        }

        /// <summary>
        /// Test case: AltinnPartyUuid cookie is missing but AltinnPartyId is present
        /// Expected: AltinnPartyUuid cookie is created based on the provided AltinnPartyId
        /// </summary>
        [Fact]
        public async Task Index_PartyUuidCookieMissing_PartyUuidCookieCreated()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1234, 50005545);
            HttpClient client = SetupUtils.GetTestClient(_factory, false);

            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");
            SetupUtils.AddLanguageCookie(httpRequestMessage);
            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");
            httpRequestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Add only AltinnPartyId cookie
            httpRequestMessage.Headers.Add("Cookie", "AltinnPartyId=50005545");

            // Act
            HttpResponseMessage response = await client.SendAsync(httpRequestMessage);
            IEnumerable<string> cookieHeaders = response.Headers.GetValues("Set-Cookie");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(4, cookieHeaders.Count()); // XSR, selectedLanguage, AS-, and AltinnPartyUuid cookies
            Assert.Single(cookieHeaders, c => c.StartsWith("AS-"));
            Assert.Single(cookieHeaders, c => c.StartsWith("XSR"));
            Assert.Single(cookieHeaders, c => c.StartsWith("selectedLanguage"));
            Assert.Single(cookieHeaders, c => c.StartsWith("AltinnPartyUuid"));
            // Verify that no AltinnPartyId cookie is set (since it was already present)
            Assert.DoesNotContain(cookieHeaders, c => c.StartsWith("AltinnPartyId"));
        }

        /// <summary>
        /// Test case: Both AltinnPartyId and AltinnPartyUuid cookies are missing
        /// Expected: Both cookies are created with the logged-in user's party information
        /// </summary>
        [Fact]
        public async Task Index_BothPartyCookiesMissing_BothCookiesCreated()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1234, 50005545);
            HttpClient client = SetupUtils.GetTestClient(_factory, false);

            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/");
            SetupUtils.AddLanguageCookie(httpRequestMessage);
            SetupUtils.AddAuthCookie(httpRequestMessage, token, "AltinnStudioRuntime");
            httpRequestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            // No party cookies added

            // Act
            HttpResponseMessage response = await client.SendAsync(httpRequestMessage);
            IEnumerable<string> cookieHeaders = response.Headers.GetValues("Set-Cookie");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(5, cookieHeaders.Count()); // XSR, selectedLanguage, AS-, AltinnPartyId, and AltinnPartyUuid cookies
            Assert.Single(cookieHeaders, c => c.StartsWith("AS-"));
            Assert.Single(cookieHeaders, c => c.StartsWith("XSR"));
            Assert.Single(cookieHeaders, c => c.StartsWith("selectedLanguage"));
            Assert.Single(cookieHeaders, c => c.StartsWith("AltinnPartyId"));
            Assert.Single(cookieHeaders, c => c.StartsWith("AltinnPartyUuid"));
        }
    }
}
