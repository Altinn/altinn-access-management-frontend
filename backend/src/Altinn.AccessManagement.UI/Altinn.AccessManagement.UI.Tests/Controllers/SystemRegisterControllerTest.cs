using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="SystemRegisterControllerTest"></see>
    /// </summary>
    [Collection("SystemRegisterControllerTest")]
    public class SystemRegisterControllerTest : IClassFixture<CustomWebApplicationFactory<SystemRegisterController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SystemRegisterControllerTest(CustomWebApplicationFactory<SystemRegisterController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetSystems checks that all systems in the system register are returned
        ///     Expected: GetSystems returns the systems in the system register
        /// </summary>
        [Fact]
        public async Task GetSystems_ReturnsAllSystem()
        {
            // Arrange
            string path = Path.Combine(_expectedDataPath, "SystemRegister", "allSystems.json");
            List<RegisteredSystemFE> expectedResponse = Util.GetMockData<List<RegisteredSystemFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemregister");
            List<RegisteredSystemFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<RegisteredSystemFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetSystemRights checks that all system rights for requested system are returned
        ///     Expected: GetSystemRights returns the system rights for the requested system
        /// </summary>
        [Fact]
        public async Task GetSystemRights_ReturnsRights()
        {
            // Arrange
            string path = Path.Combine(_expectedDataPath, "SystemRegister", "systemRights.json");
            List<ServiceResourceFE> expectedResponse = Util.GetMockData<List<ServiceResourceFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemregister/rights/310144827_smartcloud");
            List<ServiceResourceFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ServiceResourceFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }
    }
}