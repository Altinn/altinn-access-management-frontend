using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
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
        private readonly CustomWebApplicationFactory<ClientController> _factory;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ClientControllerTest(CustomWebApplicationFactory<ClientController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory);
            _testDataFolder = Path.Combine(
                Path.GetDirectoryName(new Uri(typeof(ClientControllerTest).Assembly.Location).LocalPath),
                "Data",
                "ExpectedResults",
                "ClientDelegation");
        }

        private void SetAuthHeader(HttpClient client = null)
        {
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            (client ?? _client).DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        /// <summary>
        /// Test case: GetClients returns the expected list of client delegations.
        /// </summary>
        [Fact]
        public async Task GetClients_ReturnsClients()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string path = Path.Combine(_testDataFolder, "clients.json");
            List<ClientDelegation> expectedResponse = Util.GetMockData<List<ClientDelegation>>(path);
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
            string path = Path.Combine(_testDataFolder, "agents.json");
            List<AgentDelegation> expectedResponse = Util.GetMockData<List<AgentDelegation>>(path);
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/clientdelegations/agents?party={party}");
            List<AgentDelegation> actualResponse = await response.Content.ReadFromJsonAsync<List<AgentDelegation>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetAgents with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task GetAgents_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/clientdelegations/agents?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
        /// Test case: GetAgentAccessPackages returns the expected list of client delegations.
        /// </summary>
        [Fact]
        public async Task GetAgentAccessPackages_ReturnsClients()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            string path = Path.Combine(_testDataFolder, "agentsAccessPackages.json");
            List<ClientDelegation> expectedResponse = Util.GetMockData<List<ClientDelegation>>(path);
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party={party}&to={to}");
            List<ClientDelegation> actualResponse = await response.Content.ReadFromJsonAsync<List<ClientDelegation>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetAgentAccessPackages with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task GetAgentAccessPackages_InvalidParty_ReturnsBadRequest()
        {
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party=not-a-guid&to={to}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetClientAccessPackages returns the expected list of agent delegations.
        /// </summary>
        [Fact]
        public async Task GetClientAccessPackages_ReturnsAgents()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            string path = Path.Combine(_testDataFolder, "clientsAccessPackages.json");
            List<AgentDelegation> expectedResponse = Util.GetMockData<List<AgentDelegation>>(path);
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/clientdelegations/clients/accesspackages?party={party}&from={from}");
            List<AgentDelegation> actualResponse = await response.Content.ReadFromJsonAsync<List<AgentDelegation>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetClientAccessPackages with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task GetClientAccessPackages_InvalidParty_ReturnsBadRequest()
        {
            Guid from = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/clientdelegations/clients/accesspackages?party=not-a-guid&from={from}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgentAccessPackages returns the expected list of delegations.
        /// </summary>
        [Fact]
        public async Task AddAgentAccessPackages_ReturnsDelegations()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            string path = Path.Combine(_testDataFolder, "agentsAccessPackagesDelegations.json");
            List<DelegationDto> expectedResponse = Util.GetMockData<List<DelegationDto>>(path);
            DelegationBatchInputDto payload = new DelegationBatchInputDto
            {
                Values =
                [
                    new DelegationBatchInputDto.Permission
                    {
                        Role = "DAGL",
                        Packages = ["urn:altinn:accesspackage:demo"]
                    }
                ]
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsJsonAsync(
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}",
                payload);
            List<DelegationDto> actualResponse = await response.Content.ReadFromJsonAsync<List<DelegationDto>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: AddAgentAccessPackages with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task AddAgentAccessPackages_InvalidParty_ReturnsBadRequest()
        {
            Guid from = Guid.Parse("7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            DelegationBatchInputDto payload = new DelegationBatchInputDto
            {
                Values =
                [
                    new DelegationBatchInputDto.Permission
                    {
                        Role = "DAGL",
                        Packages = ["urn:altinn:accesspackage:demo"]
                    }
                ]
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsJsonAsync(
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party=not-a-guid&from={from}&to={to}",
                payload);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgentAccessPackages returns bad request when payload is null.
        /// </summary>
        [Fact]
        public async Task AddAgentAccessPackages_NullPayload_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpContent content = new StringContent("null", Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}",
                content);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAgentAccessPackages returns no content on valid input.
        /// </summary>
        [Fact]
        public async Task RemoveAgentAccessPackages_ReturnsNoContent()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            DelegationBatchInputDto payload = new DelegationBatchInputDto
            {
                Values =
                [
                    new DelegationBatchInputDto.Permission
                    {
                        Role = "DAGL",
                        Packages = ["urn:altinn:accesspackage:demo"]
                    }
                ]
            };
            SetAuthHeader();

            HttpRequestMessage request = new HttpRequestMessage(
                HttpMethod.Delete,
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}")
            {
                Content = JsonContent.Create(payload)
            };
            HttpResponseMessage response = await _client.SendAsync(request);

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAgentAccessPackages with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveAgentAccessPackages_InvalidParty_ReturnsBadRequest()
        {
            Guid from = Guid.Parse("7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            DelegationBatchInputDto payload = new DelegationBatchInputDto
            {
                Values =
                [
                    new DelegationBatchInputDto.Permission
                    {
                        Role = "DAGL",
                        Packages = ["urn:altinn:accesspackage:demo"]
                    }
                ]
            };
            SetAuthHeader();

            HttpRequestMessage request = new HttpRequestMessage(
                HttpMethod.Delete,
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party=not-a-guid&from={from}&to={to}")
            {
                Content = JsonContent.Create(payload)
            };
            HttpResponseMessage response = await _client.SendAsync(request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAgentAccessPackages returns internal server error when client throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task RemoveAgentAccessPackages_ClientThrowsHttpStatusException_ReturnsInternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid from = Guid.Parse("7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            DelegationBatchInputDto payload = new DelegationBatchInputDto
            {
                Values =
                [
                    new DelegationBatchInputDto.Permission
                    {
                        Role = "DAGL",
                        Packages = ["urn:altinn:accesspackage:demo"]
                    }
                ]
            };

            HttpRequestMessage request = new HttpRequestMessage(
                HttpMethod.Delete,
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}")
            {
                Content = JsonContent.Create(payload)
            };
            SetAuthHeader();
            HttpResponseMessage response = await _client.SendAsync(request);
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAgentAccessPackages returns bad request when payload is null.
        /// </summary>
        [Fact]
        public async Task RemoveAgentAccessPackages_NullPayload_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpRequestMessage request = new HttpRequestMessage(
                HttpMethod.Delete,
                $"accessmanagement/api/v1/clientdelegations/agents/accesspackages?party={party}&from={from}&to={to}")
            {
                Content = new StringContent("null", Encoding.UTF8, "application/json")
            };
            HttpResponseMessage response = await _client.SendAsync(request);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
        /// Test case: AddAgent with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task AddAgent_InvalidParty_ReturnsBadRequest()
        {
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party=not-a-guid&to={to}",
                null);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgent returns an assignment when valid person input is provided.
        /// </summary>
        [Fact]
        public async Task AddAgent_ValidPersonInput_ReturnsAssignment()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "20838198385",
                LastName = "Medaljong"
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                JsonContent.Create(personInput));

            AssignmentDto assignment = await response.Content.ReadFromJsonAsync<AssignmentDto>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(assignment);
            Assert.Equal(Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), assignment.ToId);
            Assert.Equal(party, assignment.FromId);
        }

        /// <summary>
        /// Test case: AddAgent returns bad request when SSN (digits only) has invalid length.
        /// </summary>
        [Fact]
        public async Task AddAgent_InvalidSsnLength_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "20838198",
                LastName = "Medaljong",
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                JsonContent.Create(personInput));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgent returns bad request when username is shorter than 6 characters.
        /// </summary>
        [Fact]
        public async Task AddAgent_ShortUsername_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "abcde",
                LastName = "Medaljong",
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                JsonContent.Create(personInput));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAgent returns bad request when spaces are removed and username becomes too short.
        /// </summary>
        [Fact]
        public async Task AddAgent_UsernameWithSpacesBecomesTooShort_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "ab cde",
                LastName = "Medaljong",
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                JsonContent.Create(personInput));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
        /// Test case: AddAgent returns bad request when person input cannot be deserialized.
        /// </summary>
        [Fact]
        public async Task AddAgent_InvalidJson_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpContent content = new StringContent("{invalid json", Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                content);

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
        /// Test case: AddAgent returns bad request when cleaned person input becomes empty.
        /// </summary>
        [Fact]
        public async Task AddAgent_CleanedPersonInputBecomesEmpty_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "\"\"",
                LastName = "\"\"",
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}",
                JsonContent.Create(personInput));

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

        /// <summary>
        /// Test case: AddAgent returns too many requests when underlying service is rate limited.
        /// </summary>
        [Fact]
        public async Task AddAgent_TooManyRequests_ReturnsTooManyRequests()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000429");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}&to={to}",
                null);

            Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAgent returns no content for valid inputs.
        /// </summary>
        [Fact]
        public async Task RemoveAgent_ReturnsNoContent()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}&to={to}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAgent with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveAgent_InvalidParty_ReturnsBadRequest()
        {
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party=not-a-guid&to={to}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAgent returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task RemoveAgent_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            Guid to = Guid.Parse("1c9f2b8b-779e-4f7e-a04a-3f2a3c2dd8b4");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/clientdelegations/agents?party={party}&to={to}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }
    }
}
