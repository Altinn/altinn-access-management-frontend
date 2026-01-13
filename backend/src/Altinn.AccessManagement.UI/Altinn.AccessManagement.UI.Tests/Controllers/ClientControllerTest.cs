using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="ClientController"></see>
    /// </summary>
    [Collection("ClientController Tests")]
    public class ClientControllerTest : IClassFixture<CustomWebApplicationFactory<ClientController>>
    {
        private readonly string _testDataFolder;
        private readonly HttpClient _client;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ClientControllerTest(CustomWebApplicationFactory<ClientController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            _testDataFolder = Path.Combine(
                Path.GetDirectoryName(new Uri(typeof(ClientControllerTest).Assembly.Location).LocalPath),
                "Data",
                "ExpectedResults",
                "ClientDelegation");
        }

        private List<ClientDelegation> LoadClients()
        {
            string path = Path.Combine(_testDataFolder, "clients.json");
            return Util.GetMockData<List<ClientDelegation>>(path);
        }

        private List<AgentDelegation> LoadAgents()
        {
            string path = Path.Combine(_testDataFolder, "agents.json");
            return Util.GetMockData<List<AgentDelegation>>(path);
        }

        private void SetAuthHeader()
        {
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        /// <summary>
        /// Test case: GetClients returns the expected list of client delegations.
        /// </summary>
        [Fact]
        public async Task GetClients_ReturnsClients()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            List<ClientDelegation> expectedResponse = LoadClients();
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/clientdelegations/clients?party={party}");
            List<ClientDelegation> actualResponse = await response.Content.ReadFromJsonAsync<List<ClientDelegation>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetClients with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task GetClients_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/clientdelegations/clients?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetClients returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task GetClients_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/clientdelegations/clients?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetAgents returns the expected list of agent delegations.
        /// </summary>
        [Fact]
        public async Task GetAgents_ReturnsAgents()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            List<AgentDelegation> expectedResponse = LoadAgents();
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/clientdelegations/agents?party={party}");
            List<AgentDelegation> actualResponse = await response.Content.ReadFromJsonAsync<List<AgentDelegation>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetAgents returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task GetAgents_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/clientdelegations/agents?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgent returns an assignment for a valid query.
        /// </summary>
        [Fact]
        public async Task AddAgent_ReturnsAssignment()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            AssignmentDto expectedAssignment = new AssignmentDto
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                RoleId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                FromId = party,
                ToId = to,
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}&to={to}",
                null);

            AssignmentDto assignment = await response.Content.ReadFromJsonAsync<AssignmentDto>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(assignment);
            Assert.Equivalent(expectedAssignment, assignment);
        }

        /// <summary>
        /// Test case: AddAgent returns bad request when no to or person input is provided.
        /// </summary>
        [Fact]
        public async Task AddAgent_MissingToAndBody_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                null);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgent returns bad request when person input is invalid.
        /// </summary>
        [Fact]
        public async Task AddAgent_InvalidPersonInput_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            const string payload = "{\"personIdentifier\":\"123\"}";
            HttpContent content = new StringContent(payload, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                content);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgent returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task AddAgent_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}&to={to}",
                null);

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }
    }
}
