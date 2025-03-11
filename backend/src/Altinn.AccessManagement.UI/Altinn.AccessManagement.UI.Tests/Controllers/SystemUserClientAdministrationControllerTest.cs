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
    ///     Test class for <see cref="SystemUserClientAdministrationControllerTest"></see>
    /// </summary>
    [Collection("SystemUserClientAdministrationControllerTest")]
    public class SystemUserClientAdministrationControllerTest : IClassFixture<CustomWebApplicationFactory<SystemUserClientAdministrationController>>
    {
        private readonly HttpClient _client;
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SystemUserClientAdministrationControllerTest(CustomWebApplicationFactory<SystemUserClientAdministrationController> factory)
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

        /// <summary>
        ///     Test case: GetRegnskapsforerClientDelegation checks that deletated regnskapsforer customers are returned
        ///     Expected: GetRegnskapsforerClientDelegation returns delegations
        /// </summary>
        [Fact]
        public async Task GetRegnskapsforerClientDelegation_ReturnsDelegations()
        {
            // Arrange
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string partyId = "51329012";
            string systemUserId = "61844188-3789-4b84-9314-2be1fdbc6633";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "regnskapsforerClientDelegations.json");
            List<ClientDelegationFE> expectedResponse = Util.GetMockData<List<ClientDelegationFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/clientadministration/{partyId}/{systemUserId}/delegation");
            string result = await httpResponse.Content.ReadAsStringAsync();
            
            List<ClientDelegationFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ClientDelegationFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetRevisorClientDelegation checks that deletated revisor customers are returned
        ///     Expected: GetRevisorClientDelegation returns delegations
        /// </summary>
        [Fact]
        public async Task GetRevisorClientDelegation_ReturnsDelegations()
        {
            // Arrange
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string partyId = "51329012";
            string systemUserId = "244c56a5-3737-44ac-8f3b-8697c5e281da";
            string path = Path.Combine(_expectedDataPath, "SystemUser", "revisorClientDelegations.json");
            List<ClientDelegationFE> expectedResponse = Util.GetMockData<List<ClientDelegationFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/clientadministration/{partyId}/{systemUserId}/delegation");
            List<ClientDelegationFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ClientDelegationFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: PostRegnskapsforerClientDelegation checks that delegation is added
        ///     Expected: PostRegnskapsforerClientDelegation returns delegations
        /// </summary>
        [Fact]
        public async Task PostRegnskapsforerClientDelegation_ReturnsTrue()
        {
            // Arrange
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string partyId = "51329012";
            string systemUserId = "61844188-3789-4b84-9314-2be1fdbc6633";
            string customerPartyId = "50067799";
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/clientadministration/{partyId}/{systemUserId}/delegation/{customerPartyId}", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: PostRevisorClientDelegation checks that delegation is added
        ///     Expected: PostRevisorClientDelegation returns delegations
        /// </summary>
        [Fact]
        public async Task PostRevisorClientDelegation_ReturnsTrue()
        {
            // Arrange
            string partyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string partyId = "51329012";
            string systemUserId = "244c56a5-3737-44ac-8f3b-8697c5e281da";
            string customerPartyId = "51329012";
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/clientadministration/{partyId}/{systemUserId}/delegation/{customerPartyId}", null);
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }
    }
}