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
        public async Task AddAltinn2Account_ValidCredentials_ReturnsOk()
        {
            // Arrange
            Guid userPartyUuid = new Guid("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string token = PrincipalUtil.GetToken(1337, 50789533, userPartyUuid, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            Altinn2AccountRequest request = new Altinn2AccountRequest()
            {
                UserName = "testuser",
                Password = "testpassword"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/selfidentifieduser/altinn2account", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Add altinn 2 user with invalid credentials returns Unauthorized
        /// </summary>
        [Fact]
        public async Task AddAltinn2Account_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            Guid userPartyUuid = new Guid("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string token = PrincipalUtil.GetToken(1337, 50789533, userPartyUuid, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            Altinn2AccountRequest request = new Altinn2AccountRequest()
            {
                UserName = "invalid",
                Password = "invalid"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/selfidentifieduser/altinn2account", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Add altinn 2 user from valid token returns OK
        /// </summary>
        [Fact]
        public async Task AddAltinn2AccountFromToken_ValidToken_ReturnsOk()
        {
            // Arrange
            Guid userPartyUuid = new Guid("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string token = PrincipalUtil.GetToken(1337, 50789533, userPartyUuid, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            Altinn2AccountFromTokenRequest request = new Altinn2AccountFromTokenRequest()
            {
                Token = "validtoken"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/selfidentifieduser/altinn2account/token", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Add altinn 2 user from invalid token returns Unauthorized
        /// </summary>
        [Fact]
        public async Task AddAltinn2AccountFromToken_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            Guid userPartyUuid = new Guid("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string token = PrincipalUtil.GetToken(1337, 50789533, userPartyUuid, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            Altinn2AccountFromTokenRequest request = new Altinn2AccountFromTokenRequest()
            {
                Token = "invalid"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/selfidentifieduser/altinn2account/token", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Send forgot password email for valid username returns OK with masked email address
        /// </summary>
        [Fact]
        public async Task SendForgotPasswordEmail_ValidUsername_ReturnsOkWithEmailAddress()
        {
            // Arrange
            Altinn2ForgotPasswordRequest request = new Altinn2ForgotPasswordRequest()
            {
                UserName = "testuser"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync("accessmanagement/api/v1/selfidentifieduser/altinn2account/forgotpassword", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            var response = await httpResponse.Content.ReadFromJsonAsync<Altinn2ForgotPasswordResponse>();
            Assert.NotNull(response?.MaskedEmail);
        }

        /// <summary>
        ///     Test case: Send forgot password email for invalid username returns Unauthorized
        /// </summary>
        [Fact]
        public async Task SendForgotPasswordEmail_InvalidUsername_ReturnsUnauthorized()
        {
            // Arrange
            Altinn2ForgotPasswordRequest request = new Altinn2ForgotPasswordRequest()
            {
                UserName = "invalid"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync("accessmanagement/api/v1/selfidentifieduser/altinn2account/forgotpassword", JsonContent.Create(request));

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, httpResponse.StatusCode);
        }
    }
}
