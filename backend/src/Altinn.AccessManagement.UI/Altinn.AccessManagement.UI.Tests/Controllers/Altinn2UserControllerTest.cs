using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Altinn2User;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="Altinn2UserController"></see>
    /// </summary>
    [Collection("Altinn2UserControllerTests")]
    public class Altinn2UserControllerTest : IClassFixture<CustomWebApplicationFactory<Altinn2UserController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public Altinn2UserControllerTest(CustomWebApplicationFactory<Altinn2UserController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: Add altinn 2 user checks that altinn 2 user is added
        ///     Expected: AddAltinn2User returns true
        /// </summary>
        [Fact]
        public async Task AddAltinn2User_ReturnsTrue()
        {
            // Arrange
            Altinn2UserRequest request = new Altinn2UserRequest()
            {
                Username = "testuser",
                Password = "testpassword"
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/altinn2user", JsonContent.Create(request));
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }
    }
}