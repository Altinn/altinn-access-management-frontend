using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="LogoutRedirectController"></see>
    /// </summary>
    [Collection("LogoutRedirectControllerTest")]
    public class LogoutRedirectControllerTest : IClassFixture<CustomWebApplicationFactory<LogoutRedirectController>>
    {
        private readonly HttpClient _client;

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public LogoutRedirectControllerTest(CustomWebApplicationFactory<LogoutRedirectController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
        }

        /// <summary>
        ///     Test case: LogoutRedirect redirects to default URL when no cookie is present
        ///     Expected: Returns redirect response to default URL
        /// </summary>
        [Fact]
        public async Task LogoutRedirect_RedirectToDefaultUrl()
        {
            // Arrange
            string expectedUrl = "https://localhost";
           
            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/logoutredirect");

            // Assert
            Assert.Equal(HttpStatusCode.Redirect, httpResponse.StatusCode);
            Assert.Equal(expectedUrl, httpResponse.Headers.Location.OriginalString);
        }

         /// <summary>
        ///     Test case: LogoutRedirect redirects to URL from encrypted cookie
        ///     Expected: Returns redirect response to URL decrypted from cookie
        /// </summary>
        [Fact]
        public async Task LogoutRedirect_RedirectToRequestRedirectUrl()
        {
            // Arrange
            string expectedUrl = "https://smartcloud.consent";
            byte[] plainTextBytes = Encoding.UTF8.GetBytes(expectedUrl);
            string encodedUrl = Convert.ToBase64String(plainTextBytes);
            string cookieValue = $"AltinnLogoutInfo=amSafeRedirectUrl={encodedUrl}";
            
            HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Get, "accessmanagement/api/v1/logoutredirect");
            requestMessage.Headers.Add("Cookie", cookieValue);

            // Act
            HttpResponseMessage httpResponse = await _client.SendAsync(requestMessage);

            // Assert
            Assert.Equal(HttpStatusCode.Redirect, httpResponse.StatusCode);
            Assert.Equal(expectedUrl, httpResponse.Headers.Location.OriginalString);
        }
    }
}
