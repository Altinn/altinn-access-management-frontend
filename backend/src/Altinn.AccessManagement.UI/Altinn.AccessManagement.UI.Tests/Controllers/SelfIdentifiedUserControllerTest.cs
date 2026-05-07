using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SelfIdentifiedUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="SelfIdentifiedUserController"></see>
    /// </summary>
    [Collection("SelfIdentifiedUserControllerTests")]
    public class SelfIdentifiedUserControllerTest : IClassFixture<CustomWebApplicationFactory<SelfIdentifiedUserController>>
    {
        private readonly HttpClient _client;

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SelfIdentifiedUserControllerTest(CustomWebApplicationFactory<SelfIdentifiedUserController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: Add altinn 2 user with valid credentials returns OK
        /// </summary>
        [Fact]
        public async Task AddAltinn2User_ValidCredentials_ReturnsOk()
        {
            // Arrange
            Guid to = Guid.NewGuid();
            Altinn2UserRequest request = new Altinn2UserRequest()
            {
                Username = "testuser",
                Password = "testpassword"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/selfidentifieduser/altinn2user?to={to}", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Add altinn 2 user with invalid credentials returns Unauthorized
        /// </summary>
        [Fact]
        public async Task AddAltinn2User_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            Guid to = Guid.NewGuid();
            Altinn2UserRequest request = new Altinn2UserRequest()
            {
                Username = "invalid",
                Password = "invalid"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/selfidentifieduser/altinn2user?to={to}", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, httpResponse.StatusCode);
        }
    }
}
