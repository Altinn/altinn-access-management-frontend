using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
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
        private string _regnskapsforerSystemUserId = "61844188-3789-4b84-9314-2be1fdbc6633";
        private string _revisorSystemUserId = "244c56a5-3737-44ac-8f3b-8697c5e281da";
        private string _forretningsforerSystemUserId = "095b06de-1a93-4320-b572-42d72949cf2c";

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
            string partyId = "51329012";
            string systemUserId = _regnskapsforerSystemUserId;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "regnskapsforerCustomers.json");
            List<CustomerPartyFE> expectedResponse = Util.GetMockData<List<CustomerPartyFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/customers");
            List<CustomerPartyFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<CustomerPartyFE>>();

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
            string partyId = "51329012";
            string systemUserId = _revisorSystemUserId;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "revisorCustomers.json");
            List<CustomerPartyFE> expectedResponse = Util.GetMockData<List<CustomerPartyFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/customers");
            List<CustomerPartyFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<CustomerPartyFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetForretningsforerCustomers checks that customers are returned
        ///     Expected: GetForretningsforerCustomers returns customers
        /// </summary>
        [Fact]
        public async Task GetForretningsforerCustomers_ReturnsCustomers()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _forretningsforerSystemUserId;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "forretningsforerCustomers.json");
            List<CustomerPartyFE> expectedResponse = Util.GetMockData<List<CustomerPartyFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/customers");
            List<CustomerPartyFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<CustomerPartyFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetRegnskapsforerAgentDelegation checks that delegated regnskapsforer customers are returned
        ///     Expected: GetRegnskapsforerAgentDelegation returns delegations
        /// </summary>
        [Fact]
        public async Task GetRegnskapsforerAgentDelegation_ReturnsDelegations()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _regnskapsforerSystemUserId;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "regnskapsforerAgentDelegations.json");
            List<AgentDelegationFE> expectedResponse = Util.GetMockData<List<AgentDelegationFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation");
            List<AgentDelegationFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<AgentDelegationFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetRevisorAgentDelegation checks that delegated revisor customers are returned
        ///     Expected: GetRevisorAgentDelegation returns delegations
        /// </summary>
        [Fact]
        public async Task GetRevisorAgentDelegation_ReturnsDelegations()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _revisorSystemUserId;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "revisorAgentDelegations.json");
            List<AgentDelegationFE> expectedResponse = Util.GetMockData<List<AgentDelegationFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation");
            List<AgentDelegationFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<AgentDelegationFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetForretningsforerAgentDelegation checks that delegated forretningsforer customers are returned
        ///     Expected: GetForretningsforerAgentDelegation returns delegations
        /// </summary>
        [Fact]
        public async Task GetForretningsforerAgentDelegation_ReturnsDelegations()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _forretningsforerSystemUserId;
            string path = Path.Combine(_expectedDataPath, "SystemUser", "forretningsforerAgentDelegations.json");
            List<AgentDelegationFE> expectedResponse = Util.GetMockData<List<AgentDelegationFE>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation");
            List<AgentDelegationFE> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<AgentDelegationFE>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: PostRegnskapsforerAgentDelegation checks that delegation is added
        ///     Expected: PostRegnskapsforerAgentDelegation returns assignments
        /// </summary>
        [Fact]
        public async Task PostRegnskapsforerAgentDelegation_ReturnsAssignment()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _regnskapsforerSystemUserId;
            string customerId = "6b0574ae-f569-4c0d-a8d4-8ad56f427890";
            
            AgentDelegationRequestFE dto = new AgentDelegationRequestFE
            {
                CustomerId = Guid.Parse(customerId)
            };
            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            AgentDelegationFE expectedResponse = new AgentDelegationFE()
            {
                DelegationId = Guid.NewGuid(),
                CustomerId = Guid.Parse(customerId),
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation", content);
            AgentDelegationFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<AgentDelegationFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: PostRevisorAgentDelegation checks that delegation is added
        ///     Expected: PostRevisorAgentDelegation returns assignment
        /// </summary>
        [Fact]
        public async Task PostRevisorAgentDelegation_ReturnsAssignment()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _revisorSystemUserId;
            string customerId = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            
            AgentDelegationRequestFE dto = new AgentDelegationRequestFE
            {
                CustomerId = Guid.Parse(customerId)
            };
            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            AgentDelegationFE expectedResponse = new AgentDelegationFE()
            {
                DelegationId = Guid.NewGuid(),
                CustomerId = Guid.Parse(customerId)
            };

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation", content);
            AgentDelegationFE actualResponse = await httpResponse.Content.ReadFromJsonAsync<AgentDelegationFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: PostRegnskapsforerAgentDelegation checks error handling for invalid delegations
        ///     Expected: PostRegnskapsforerAgentDelegation returns NotFound error
        /// </summary>
        [Fact]
        public async Task PostRegnskapsforerAgentDelegation_ReturnsError()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _regnskapsforerSystemUserId;
            string customerId = "82cc64c5-60ff-4184-8c07-964c3a1e6fc7";
            
            AgentDelegationRequestFE dto = new AgentDelegationRequestFE
            {
                CustomerId = Guid.Parse(customerId),
            };
            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation", content);

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: DeleteRegnskapsforerAgentDelegation checks that delegation is removed
        ///     Expected: DeleteRegnskapsforerAgentDelegation returns true
        /// </summary>
        [Fact]
        public async Task DeleteRegnskapsforerAgentDelegation_ReturnsTrue()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _regnskapsforerSystemUserId;
            string delegationId = "7da509f3-cff5-4253-946e-0336ae0bc48f";
            
            bool expectedResponse = true;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation/{delegationId}");
            bool actualResponse = await httpResponse.Content.ReadFromJsonAsync<bool>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: DeleteRegnskapsforerAgentDelegation checks error handling for non-existent delegations
        ///     Expected: DeleteRegnskapsforerAgentDelegation returns NotFound error
        /// </summary>
        [Fact]
        public async Task DeleteRegnskapsforerAgentDelegation_ReturnsError()
        {
            // Arrange
            string partyId = "51329012";
            string systemUserId = _regnskapsforerSystemUserId;
            string delegationId = "60f1ade9-ed48-4083-a369-178d45d6ffd1";
            
            HttpStatusCode expectedResponse = HttpStatusCode.NotFound;

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/systemuser/agentdelegation/{partyId}/{systemUserId}/delegation/{delegationId}");

            // Assert
            Assert.Equal(expectedResponse, httpResponse.StatusCode);
        }
    }
}