using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="SystemUserAgentDelegationControllerTest"></see>
    /// </summary>
    [Collection("SystemUserAgentDelegationControllerTest")]
    public class SystemUserAgentDelegationControllerTest : IClassFixture<CustomWebApplicationFactory<SystemUserAgentDelegationController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SystemUserAgentDelegationControllerTest(CustomWebApplicationFactory<SystemUserAgentDelegationController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetRegnskapsforerCustomers checks that customers are returned
        ///     Expected: GetRegnskapsforerCustomers returns customers
        /// </summary>
        [Fact]
        public async Task GetRegnskapsforerCustomers_ReturnsCustomers()
        {
            // Arrange
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "regnskapsforerCustomers.json");
            List<ClientPartyFE> expectedResponse = Util.GetMockData<List<ClientPartyFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/clientadministration/{partyUuid}/customers/regnskapsforer");
            List<ClientPartyFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ClientPartyFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetRevisorCustomers checks that customers are returned
        ///     Expected: GetRevisorCustomers returns customers
        /// </summary>
        [Fact]
        public async Task GetRevisorCustomers_ReturnsCustomers()
        {
            // Arrange
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "revisorCustomers.json");
            List<ClientPartyFE> expectedResponse = Util.GetMockData<List<ClientPartyFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/clientadministration/{partyUuid}/customers/revisor");
            List<ClientPartyFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ClientPartyFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }
    }
}