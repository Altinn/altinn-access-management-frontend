using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using AltinnCore.Authentication.JwtCookie;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="InstanceController"/>.
    /// </summary>
    [Collection("InstanceControllerTest")]
    public class InstanceControllerTest : IClassFixture<CustomWebApplicationFactory<InstanceController>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<InstanceController> _factory;
        private readonly string _mockFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceControllerTest"/> class.
        /// </summary>
        /// <param name="factory">The custom web application factory.</param>
        public InstanceControllerTest(CustomWebApplicationFactory<InstanceController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetInstanceTestClient(factory);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _mockFolder = Path.GetDirectoryName(new Uri(typeof(InstanceClientMock).Assembly.Location).LocalPath);
        }

        /// <summary>
        /// Test case: Successfully retrieve delegated instances for a specific from/to combination.
        /// Expected: Returns OK and the list of delegated instances.
        /// </summary>
        [Fact]
        public async Task GetInstances_ReturnsValid()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstances", "instances.json");
            List<InstanceDelegation> expectedResponse = Util.GetMockData<List<InstanceDelegation>>(path);

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&to={to}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(expectedResponse.Count, actualResponse.Count);
            Assert.Equal(expectedResponse[0].Resource.Identifier, actualResponse[0].Resource.Identifier);
            Assert.Equal(expectedResponse[0].Instance.Urn, actualResponse[0].Instance.Urn);
            Assert.Equal(expectedResponse[1].Resource.Identifier, actualResponse[1].Resource.Identifier);
            Assert.Equal(expectedResponse[1].Instance.Urn, actualResponse[1].Instance.Urn);
        }

        /// <summary>
        /// Test case: Successfully retrieve delegated instances from the delegation/instances route.
        /// Expected: Returns OK and the list of delegated instances.
        /// </summary>
        [Fact]
        public async Task GetInstances_DelegationInstancesRoute_ReturnsValid()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");

            HttpResponseMessage httpResponse =
                await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&to={to}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(2, actualResponse.Count);
        }

        /// <summary>
        /// Test case: Supports omitting the to parameter.
        /// Expected: Returns OK when only from is specified.
        /// </summary>
        [Fact]
        public async Task GetInstances_WithOnlyFrom_ReturnsValid()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(2, actualResponse.Count);
        }

        /// <summary>
        /// Test case: Applies optional resource and instance filters.
        /// Expected: Returns only the matching delegated instance.
        /// </summary>
        [Fact]
        public async Task GetInstances_WithFilters_ReturnsFilteredResults()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resource = "app_ttd_a3-app2";
            string instance = "urn:altinn:instance-id:51599233/c1d2e3f4-1111-2222-3333-444455556666";

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Single(actualResponse);
            Assert.Equal(resource, actualResponse[0].Resource.Identifier);
            Assert.Equal(instance, actualResponse[0].Instance.Urn);
        }

        /// <summary>
        /// Test case: Supports omitting both from and to parameters.
        /// Expected: Returns all delegated instances.
        /// </summary>
        [Fact]
        public async Task GetInstances_MissingFromAndTo_ReturnsValid()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstances", "instances.json");
            List<InstanceDelegation> expectedResponse = Util.GetMockData<List<InstanceDelegation>>(path);

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(expectedResponse.Count, actualResponse.Count);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when retrieving delegated instances.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task GetInstances_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles HttpStatusException when retrieving delegated instances.
        /// Expected: Returns bad request.
        /// </summary>
        [Fact]
        public async Task GetInstances_HttpStatusException()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("11111111-1111-1111-1111-111111111111");

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Successfully perform delegation check on an instance.
        /// Expected: Returns OK and the checked accesses of the given instance.
        /// </summary>
        [Fact]
        public async Task DelegationCheck_ReturnsValid()
        {
            string party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "DelegationCheck", $"{resource}.json");
            List<RightCheck> expectedResponse = Util.GetMockData<List<RightCheck>>(path);

            HttpResponseMessage httpResponse =
                await _client.GetAsync($"accessmanagement/api/v1/instances/delegationcheck?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            List<RightCheck> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<RightCheck>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        /// Test case: Try to perform delegation check on an instance that does not exist.
        /// Expected: Returns bad request.
        /// </summary>
        [Fact]
        public async Task DelegationCheck_InvalidInstance()
        {
            string party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/non-existing-instance";

            HttpResponseMessage httpResponse =
                await _client.GetAsync($"accessmanagement/api/v1/instances/delegationcheck?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles unexpected errors by returning a 500 status.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task DelegationCheck_InternalServerError()
        {
            string party = "00000000-0000-0000-0000-000000000000";
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse =
                await _client.GetAsync($"accessmanagement/api/v1/instances/delegationcheck?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Successfully retrieve delegated rights for an instance.
        /// Expected: Returns OK and the instance rights.
        /// </summary>
        [Fact]
        public async Task GetInstanceRights_ReturnsValid()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstanceRights", $"{resource}.json");
            InstanceRight expectedResponse = Util.GetMockData<InstanceRight>(path);

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            InstanceRight actualResponse = await httpResponse.Content.ReadFromJsonAsync<InstanceRight>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(expectedResponse.Resource.RefId, actualResponse.Resource.RefId);
            Assert.Equal(expectedResponse.Instance.Urn, actualResponse.Instance.Urn);
            Assert.Equal(expectedResponse.DirectRights.Count, actualResponse.DirectRights.Count);
            Assert.Equal(expectedResponse.IndirectRights.Count, actualResponse.IndirectRights.Count);
        }

        /// <summary>
        /// Test case: Successfully retrieve delegated instance rights from the delegation/instances/rights route.
        /// Expected: Returns OK and the instance rights.
        /// </summary>
        [Fact]
        public async Task GetInstanceRights_DelegationInstancesRoute_ReturnsValid()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            InstanceRight actualResponse = await httpResponse.Content.ReadFromJsonAsync<InstanceRight>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(resource, actualResponse.Resource.RefId);
            Assert.Equal(instance, actualResponse.Instance.Urn);
        }

        /// <summary>
        /// Test case: Missing required rights parameters.
        /// Expected: Returns not found because the mock cannot resolve the missing resource/instance.
        /// </summary>
        [Fact]
        public async Task GetInstanceRights_MissingRequiredParams_ReturnsNotFound()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}");

            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when retrieving delegated instance rights.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task GetInstanceRights_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles HttpStatusException when retrieving delegated instance rights.
        /// Expected: Returns bad request.
        /// </summary>
        [Fact]
        public async Task GetInstanceRights_HttpStatusException()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("11111111-1111-1111-1111-111111111111");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Successfully delegate rights on an instance.
        /// Expected: Returns OK.
        /// </summary>
        [Fact]
        public async Task DelegateInstanceRights_Success()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "read", "write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PostAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles backend status errors when delegating rights on an instance.
        /// Expected: Returns bad request.
        /// </summary>
        [Fact]
        public async Task DelegateInstanceRights_HttpStatusException()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("11111111-1111-1111-1111-111111111111");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "read" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PostAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when delegating rights on an instance.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task DelegateInstanceRights_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "read", "write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PostAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Successfully update delegated rights on an instance.
        /// Expected: Returns OK.
        /// </summary>
        [Fact]
        public async Task EditInstanceAccess_Success()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "read" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PutAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles backend status errors when updating rights on an instance.
        /// Expected: Returns bad request.
        /// </summary>
        [Fact]
        public async Task EditInstanceAccess_HttpStatusException()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("11111111-1111-1111-1111-111111111111");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PutAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when updating rights on an instance.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task EditInstanceAccess_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PutAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Directly invoke the controller when the backend returns a non-success response for delegation.
        /// Expected: Returns problem details with the backend status code.
        /// </summary>
        [Fact]
        public async Task DelegateInstanceRights_UnsuccessfulBackendResponse_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = ["read"];

            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.Delegate(party, to, resource, instance, actionKeys))
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.Forbidden));
            HttpClient client = GetTestClient(instanceServiceMock.Object);
            HttpContent content = new StringContent(JsonSerializer.Serialize(actionKeys), Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await client.PostAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);
            ProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.Forbidden, httpResponse.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.Forbidden, problemDetails.Status);
            Assert.Equal("Error returned from backend", problemDetails.Title);
        }

        /// <summary>
        /// Test case: Directly invoke the controller when the backend returns a non-success response for updates.
        /// Expected: Returns problem details with the backend status code.
        /// </summary>
        [Fact]
        public async Task EditInstanceAccess_UnsuccessfulBackendResponse_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = ["write"];

            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.UpdateInstanceAccess(party, to, resource, instance, actionKeys))
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.Conflict));
            HttpClient client = GetTestClient(instanceServiceMock.Object);
            HttpContent content = new StringContent(JsonSerializer.Serialize(actionKeys), Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await client.PutAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);
            ProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.Conflict, httpResponse.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.Conflict, problemDetails.Status);
            Assert.Equal("Error returned from backend", problemDetails.Title);
        }

        /// <summary>
        /// Test case: Handles unknown instance/resource combinations.
        /// Expected: Returns not found.
        /// </summary>
        [Fact]
        public async Task GetInstanceRights_NotFound()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "app_ttd_a3-app";
            string instance = "urn:altinn:instance-id:51599233/non-existing-instance";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        private HttpClient GetTestClient(IInstanceService instanceService)
        {
            WebApplicationFactory<InstanceController> factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton(instanceService);
                    services.AddSingleton<ILogger<InstanceController>>(new Mock<ILogger<InstanceController>>().Object);
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });

            WebApplicationFactoryClientOptions opts = new WebApplicationFactoryClientOptions
            {
                HandleCookies = true,
            };

            factory.Server.AllowSynchronousIO = true;
            HttpClient client = factory.CreateClient(opts);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetAccessToken("sbl.authorization"));
            client.DefaultRequestHeaders.Add("Cookie", "altinnPersistentContext=UL=1044");
            client.DefaultRequestHeaders.Add("Cookie", "selectedLanguage=no_nb");

            return client;
        }
    }
}
