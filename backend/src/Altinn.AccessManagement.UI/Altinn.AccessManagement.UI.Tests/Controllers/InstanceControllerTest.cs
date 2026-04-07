using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Linq;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Core.Models.Dialogporten;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Core.Services;
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
            _client = SetupUtils.GetTestClient(factory);
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
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
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
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstances", "instances.json");
            List<InstanceDelegation> expectedResponse = Util.GetMockData<List<InstanceDelegation>>(path);

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
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
            string resource = "abctest";
            string instance = "urn:altinn:instance-id:51599233/c1d2e3f4-1111-2222-3333-444455556666";
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstances", "instances.json");
            List<InstanceDelegation> expectedResponses = Util.GetMockData<List<InstanceDelegation>>(path);
            InstanceDelegation expectedResponse = expectedResponses.Single(delegation =>
                delegation.Resource.Identifier == resource &&
                delegation.Instance.RefId == instance);

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Single(actualResponse);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse[0]);
        }

        /// <summary>
        /// Test case: Returns dialog metadata when dialogporten lookup succeeds.
        /// Expected: Returns OK and the instance with dialog lookup metadata.
        /// </summary>
        [Fact]
        public async Task GetInstances_WhenDialogLookupSucceeds_ReturnsDialogMetadata()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&instance={Uri.EscapeDataString(instance)}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Single(actualResponse);
            Assert.NotNull(actualResponse[0].DialogLookup);
            Assert.Equal(Guid.Parse("11111111-1111-1111-1111-111111111111"), actualResponse[0].DialogLookup.DialogId);
            Assert.Equal(instance, actualResponse[0].DialogLookup.InstanceRef);
            Assert.NotNull(actualResponse[0].DialogLookup.Title);
            Assert.Single(actualResponse[0].DialogLookup.Title);
            Assert.Equal("Dialog for generic-access-resource", actualResponse[0].DialogLookup.Title[0].Value);
        }

        /// <summary>
        /// Test case: Returns the instance even when dialogporten lookup is not found.
        /// Expected: Returns OK and the instance without dialog lookup data.
        /// </summary>
        [Fact]
        public async Task GetInstances_WhenDialogLookupIsMissing_ReturnsInstanceWithoutDialogData()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string instance = "urn:altinn:instance-id:51599233/6f4a3c12-8fd1-4a8b-8dc6-777777777777";
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstances", "instances.json");
            List<InstanceDelegation> expectedResponses = Util.GetMockData<List<InstanceDelegation>>(path);
            InstanceDelegation expectedResponse = expectedResponses.Single(delegation => delegation.Instance.RefId == instance);

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&instance={Uri.EscapeDataString(instance)}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Single(actualResponse);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse[0]);
            Assert.NotNull(actualResponse[0].DialogLookup);
            Assert.Equal(DialogLookupStatus.NotFound, actualResponse[0].DialogLookup.Status);
        }

        /// <summary>
        /// Test case: Rejects requests that omit both from and to parameters.
        /// Expected: Returns bad request.
        /// </summary>
        [Fact]
        public async Task GetInstances_MissingFromAndTo_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}");
            string actualResponse = await httpResponse.Content.ReadFromJsonAsync<string>();

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
            Assert.Equal("Either 'from' or 'to' query parameter must be provided.", actualResponse);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when retrieving delegated instances.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task GetInstances_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");// Triggers exception in client mock
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: PID-enriched token retrieval fails before dialog lookup.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task GetInstances_WhenPidEnrichedTokenFails_ReturnsInternalServerError()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            var authenticationClientMock = new Mock<IAuthenticationClient>();
            authenticationClientMock
                .Setup(client => client.GetPidEnrichedToken())
                .ThrowsAsync(new Exception("Failed to fetch enriched token"));

            var instanceClientMock = new Mock<IInstanceClient>(MockBehavior.Strict);
            var dialogportClientMock = new Mock<IDialogportClient>(MockBehavior.Strict);
            var resourceServiceMock = new Mock<IResourceService>(MockBehavior.Strict);
            var instanceService = new InstanceService(
                authenticationClientMock.Object,
                Options.Create(new FeatureFlags { EnableDialogportenDialogLookup = true }),
                dialogportClientMock.Object,
                instanceClientMock.Object,
                new Mock<ILogger<InstanceService>>().Object,
                resourceServiceMock.Object);

            HttpClient client = GetTestClient(instanceService);

            HttpResponseMessage httpResponse = await client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
            instanceClientMock.Verify(
                service => service.GetDelegatedInstances(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<string>()),
                Times.Never);
        }

        /// <summary>
        /// Test case: Dialogporten lookup throws an exception for an instance.
        /// Expected: Returns OK with the instance included but DialogLookup is null (failure is swallowed).
        /// </summary>
        [Fact]
        public async Task GetInstances_WhenDialogLookupThrows_ReturnsInstanceWithoutDialogData()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string instanceRef = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            var authenticationClientMock = new Mock<IAuthenticationClient>();
            authenticationClientMock
                .Setup(c => c.GetPidEnrichedToken())
                .ReturnsAsync("enriched-token");

            var dialogportClientMock = new Mock<IDialogportClient>();
            dialogportClientMock
                .Setup(c => c.GetDialogLookupByInstanceRef(It.IsAny<string>(), It.IsAny<string>(), instanceRef))
                .ThrowsAsync(new Exception("Dialogporten unavailable"));

            var instanceService = new InstanceService(
                authenticationClientMock.Object,
                Options.Create(new FeatureFlags { EnableDialogportenDialogLookup = true }),
                dialogportClientMock.Object,
                new InstanceClientMock(null, new Mock<ILogger<InstanceClientMock>>().Object, null),
                new Mock<ILogger<InstanceService>>().Object,
                _factory.Services.GetRequiredService<IResourceService>());

            HttpClient client = GetTestClient(instanceService);

            HttpResponseMessage httpResponse = await client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&instance={Uri.EscapeDataString(instanceRef)}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Single(actualResponse);
            Assert.Null(actualResponse[0].DialogLookup);
        }

        /// <summary>
        /// Test case: Dialogporten lookup is skipped when the instance has no RefId.
        /// Expected: Returns OK with the instance included and DialogLookup is null (dialogporten never called).
        /// </summary>
        [Fact]
        public async Task GetInstances_WhenInstanceRefIdIsNull_SkipsDialogLookup()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "generic-access-resource";

            var authenticationClientMock = new Mock<IAuthenticationClient>();
            authenticationClientMock
                .Setup(c => c.GetPidEnrichedToken())
                .ReturnsAsync("enriched-token");

            var instanceClientMock = new Mock<IInstanceClient>();
            instanceClientMock
                .Setup(c => c.GetDelegatedInstances(It.IsAny<string>(), party, from, null, null, null))
                .ReturnsAsync(
                [
                    new InstancePermission
                    {
                        Resource = new ResourceAM { RefId = resourceId },
                        Instance = new DelegationInstance { RefId = null },
                        Permissions = []
                    }
                ]);

            var resourceServiceMock = new Mock<IResourceService>();
            resourceServiceMock
                .Setup(s => s.GetResource(resourceId, It.IsAny<string>()))
                .ReturnsAsync(new ServiceResourceFE { Identifier = resourceId });

            // Strict mock: any call to dialogporten will fail the test
            var dialogportClientMock = new Mock<IDialogportClient>(MockBehavior.Strict);

            var instanceService = new InstanceService(
                authenticationClientMock.Object,
                Options.Create(new FeatureFlags { EnableDialogportenDialogLookup = true }),
                dialogportClientMock.Object,
                instanceClientMock.Object,
                new Mock<ILogger<InstanceService>>().Object,
                resourceServiceMock.Object);

            HttpClient client = GetTestClient(instanceService);

            HttpResponseMessage httpResponse = await client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Single(actualResponse);
            Assert.Null(actualResponse[0].DialogLookup);
        }

        /// <summary>
        /// Test case: Dialogporten feature flag is disabled.
        /// Expected: Returns OK with delegations and neither auth nor dialogporten is called.
        /// </summary>
        [Fact]
        public async Task GetInstances_WhenDialogportenFeatureFlagDisabled_ReturnsDelegationsWithoutDialogLookup()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "generic-access-resource";

            // Strict mocks: any call to auth or dialogporten will fail the test
            var authenticationClientMock = new Mock<IAuthenticationClient>(MockBehavior.Strict);
            var dialogportClientMock = new Mock<IDialogportClient>(MockBehavior.Strict);

            var instanceClientMock = new Mock<IInstanceClient>();
            instanceClientMock
                .Setup(c => c.GetDelegatedInstances(It.IsAny<string>(), party, from, null, null, null))
                .ReturnsAsync(
                [
                    new InstancePermission
                    {
                        Resource = new ResourceAM { RefId = resourceId },
                        Instance = new DelegationInstance { RefId = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668" },
                        Permissions = []
                    }
                ]);

            var resourceServiceMock = new Mock<IResourceService>();
            resourceServiceMock
                .Setup(s => s.GetResource(resourceId, It.IsAny<string>()))
                .ReturnsAsync(new ServiceResourceFE { Identifier = resourceId });

            var instanceService = new InstanceService(
                authenticationClientMock.Object,
                Options.Create(new FeatureFlags { EnableDialogportenDialogLookup = false }),
                dialogportClientMock.Object,
                instanceClientMock.Object,
                new Mock<ILogger<InstanceService>>().Object,
                resourceServiceMock.Object);

            HttpClient client = GetTestClient(instanceService);

            HttpResponseMessage httpResponse = await client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");
            List<InstanceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<InstanceDelegation>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Single(actualResponse);
            Assert.All(actualResponse, d => Assert.Null(d.DialogLookup));
        }

        /// <summary>
        /// Test case: Successfully perform delegation check on an instance.
        /// Expected: Returns OK and the checked accesses of the given instance.
        /// </summary>
        [Fact]
        public async Task DelegationCheck_ReturnsValid()
        {
            string party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string resource = "generic-access-resource";
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
        /// Test case: The mock delegation check returns null.
        /// Expected: Returns OK with an empty list.
        /// </summary>
        [Fact]
        public async Task DelegationCheck_NullResponse_ReturnsEmptyList()
        {
            string party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string resource = "app_ttd_a3-app-null";
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
        /// Test case: The mock delegation check returns an object with null rights.
        /// Expected: Returns OK with an empty list.
        /// </summary>
        [Fact]
        public async Task DelegationCheck_NullRights_ReturnsEmptyList()
        {
            string party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string resource = "app_ttd_a3-app-null-rights";
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
            string resource = "generic-access-resource";
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
            string party = "00000000-0000-0000-0000-000000000000";// Triggers exception in client mock
            string resource = "generic-access-resource";
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
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstanceRights", $"{resource}.json");
            InstanceRights expectedResponse = Util.GetMockData<InstanceRights>(path);

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            InstanceRights actualResponse = await httpResponse.Content.ReadFromJsonAsync<InstanceRights>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: Missing required rights parameters.
        /// Expected: Returns not found.
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
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000"); // Triggers exception in client mock
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
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
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "read", "write" };
            InstanceRightsDelegationDto input = new()
            {
                DirectRightKeys = actionKeys
            };

            string jsonInput = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonInput, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PostAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Successfully delegate rights on an instance while creating a new recipient from person input.
        /// Expected: Returns OK.
        /// </summary>
        [Fact]
        public async Task DelegateInstanceRights_Success_WithPersonInput()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = ["read"];

            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.Delegate(
                    party,
                    null,
                    resource,
                    instance,
                    It.Is<InstanceRightsDelegationDto>(request =>
                        request.To != null &&
                        request.To.PersonIdentifier == "20838198385" &&
                        request.To.LastName == "Medaljong" &&
                        request.DirectRightKeys.SequenceEqual(actionKeys))))
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

            HttpClient client = GetTestClient(instanceServiceMock.Object);
            InstanceRightsDelegationDto input = new()
            {
                To = new PersonInput
                {
                    PersonIdentifier = "20838198385",
                    LastName = "Medaljong"
                },
                DirectRightKeys = actionKeys
            };

            HttpContent content = new StringContent(JsonSerializer.Serialize(input), Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await client.PostAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when delegating rights on an instance.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task DelegateInstanceRights_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");// Triggers exception in client mock
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "read", "write" };
            InstanceRightsDelegationDto input = new()
            {
                DirectRightKeys = actionKeys
            };

            string jsonInput = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonInput, Encoding.UTF8, "application/json");

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
            string resource = "generic-access-resource";
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
        /// Test case: Directly invoke the controller when the backend returns a non-success response for delegation.
        /// Expected: Returns problem details with the backend status code.
        /// </summary>
        [Fact]
        public async Task DelegateInstanceRights_UnsuccessfulBackendResponse_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = ["read"];
            InstanceRightsDelegationDto input = new()
            {
                DirectRightKeys = actionKeys
            };

            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.Delegate(
                    party,
                    to,
                    resource,
                    instance,
                    It.Is<InstanceRightsDelegationDto>(request =>
                        request.To == null &&
                        request.DirectRightKeys.SequenceEqual(actionKeys))))
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.Forbidden));
            HttpClient client = GetTestClient(instanceServiceMock.Object);
            HttpContent content = new StringContent(JsonSerializer.Serialize(input), Encoding.UTF8, "application/json");

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
            string resource = "generic-access-resource";
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
        /// Test case: Handles HttpStatusException when retrieving delegated instances.
        /// Expected: Returns problem details with the backend status code.
        /// </summary>
        [Fact]
        public async Task GetInstances_HttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.GetDelegatedInstances(It.IsAny<string>(), party, from, null, null, null))
                .ThrowsAsync(new HttpStatusException("StatusError", "Test error", HttpStatusCode.BadGateway, ""));
            HttpClient client = GetTestClient(instanceServiceMock.Object);

            HttpResponseMessage httpResponse = await client.GetAsync($"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}");
            ProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.BadGateway, httpResponse.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.BadGateway, problemDetails.Status);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when updating instance access.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task EditInstanceAccess_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");// Triggers exception in client mock
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            List<string> actionKeys = new List<string> { "read" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            HttpResponseMessage httpResponse = await _client.PutAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}",
                content);

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Successfully retrieve users who have direct access to an instance.
        /// Expected: Returns OK and the list of simplified parties.
        /// </summary>
        [Fact]
        public async Task GetInstanceUsers_ReturnsValid()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            string path = Path.Combine(_mockFolder, "Data", "ExpectedResults", "Instance", "GetInstanceUsers", $"{resource}.json");
            List<SimplifiedParty> expectedResponse = Util.GetMockData<List<SimplifiedParty>>(path);

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/simplified/users?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            List<SimplifiedParty> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<SimplifiedParty>>();

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        /// Test case: Rejects empty party values when retrieving users with direct instance access.
        /// Expected: Returns a bad request problem details response.
        /// </summary>
        [Fact]
        public async Task GetInstanceUsers_EmptyParty_ReturnsBadRequest()
        {
            Guid party = Guid.Empty;
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/simplified/users?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            ProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.BadRequest, problemDetails.Status);
        }

        /// <summary>
        /// Test case: Rejects missing or whitespace resource and instance values when retrieving users with direct instance access.
        /// Expected: Returns a bad request problem details response.
        /// </summary>
        [Theory]
        [InlineData(null, "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668")]
        [InlineData("", "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668")]
        [InlineData("   ", "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668")]
        [InlineData("generic-access-resource", null)]
        [InlineData("generic-access-resource", "")]
        [InlineData("generic-access-resource", "   ")]
        public async Task GetInstanceUsers_InvalidResourceOrInstance_ReturnsBadRequest(string resource, string instance)
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            var query = new List<string> { $"party={party}" };

            if (resource is not null)
            {
                query.Add($"resource={Uri.EscapeDataString(resource)}");
            }

            if (instance is not null)
            {
                query.Add($"instance={Uri.EscapeDataString(instance)}");
            }

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/simplified/users?{string.Join("&", query)}");
            ProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.BadRequest, problemDetails.Status);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when retrieving users with direct instance access.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task GetInstanceUsers_InternalServerError()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.GetInstanceUsers(party, resource, instance))
                .ThrowsAsync(new Exception("Unexpected failure"));
            HttpClient client = GetTestClient(instanceServiceMock.Object);

            HttpResponseMessage httpResponse = await client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/simplified/users?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles HttpStatusException when retrieving users with direct instance access.
        /// Expected: Returns problem details with the backend status code and detail message.
        /// </summary>
        [Fact]
        public async Task GetInstanceUsers_HttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";
            const string errorMessage = "Backend denied access to instance users.";

            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.GetInstanceUsers(party, resource, instance))
                .ThrowsAsync(new HttpStatusException("Forbidden", "Forbidden", HttpStatusCode.Forbidden, string.Empty, errorMessage));
            HttpClient client = GetTestClient(instanceServiceMock.Object);

            HttpResponseMessage httpResponse = await client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/simplified/users?party={party}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            ProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.Forbidden, httpResponse.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.Forbidden, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal(errorMessage, problemDetails.Detail);
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
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/non-existing-instance";

            HttpResponseMessage httpResponse = await _client.GetAsync(
                $"accessmanagement/api/v1/instances/delegation/instances/rights?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Successfully remove an instance delegation.
        /// Expected: Returns OK.
        /// </summary>
        [Fact]
        public async Task RemoveInstance_Success()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.DeleteAsync(
                $"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Handles unexpected errors when removing an instance delegation.
        /// Expected: Returns an internal server error.
        /// </summary>
        [Fact]
        public async Task RemoveInstance_InternalServerError()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");// Triggers exception in client mock
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            HttpResponseMessage httpResponse = await _client.DeleteAsync(
                $"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");

            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        /// Test case: Backend returns a non-success status code without throwing.
        /// Expected: Returns problem details with the backend status code.
        /// </summary>
        [Fact]
        public async Task RemoveInstance_UnsuccessfulBackendResponse_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resource = "generic-access-resource";
            string instance = "urn:altinn:instance-id:51599233/df333e75-5896-4254-a69f-146736eaf668";

            var instanceServiceMock = new Mock<IInstanceService>();
            instanceServiceMock
                .Setup(service => service.RemoveInstance(party, from, to, resource, instance))
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.Forbidden));
            HttpClient client = GetTestClient(instanceServiceMock.Object);

            HttpResponseMessage httpResponse = await client.DeleteAsync(
                $"accessmanagement/api/v1/instances/delegation/instances?party={party}&from={from}&to={to}&resource={resource}&instance={Uri.EscapeDataString(instance)}");
            ProblemDetails problemDetails = await httpResponse.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.Forbidden, httpResponse.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.Forbidden, problemDetails.Status);
            Assert.Equal("Error returned from backend", problemDetails.Title);
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
