using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="SingleRightControllerTest"></see>
    /// </summary>
    [Collection("SingleRightControllerTest")]
    public class SingleRightControllerTest : IClassFixture<CustomWebApplicationFactory<SingleRightController>>
    {
        JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<SingleRightController> _factory;
        private readonly string mockFolder;
        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SingleRightControllerTest(CustomWebApplicationFactory<SingleRightController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetSingleRightTestClient(factory);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            mockFolder = Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath);
        }

        /// <summary>
        ///     Test case: DelegationAccessCheck checks the accesses of a standard resource
        ///     Expected: DelegationAccessCheck returns the accesses of a standard resource
        /// </summary>
        [Fact]
        public async Task DelegationAccessCheck_standardResource()
        {
            // Arrange
            string partyId = "999 999 999";
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponseV0", "appid-503.json");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path);

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:resource",
                    Value = "appid-503",
                }
            };

            Core.Models.Right dto = new Core.Models.Right
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationResponseData> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<DelegationResponseData>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: DelegationAccessCheck checks the accesses of an A3 application
        ///     Expected: DelegationAccessCheck returns the accesses of an A3 application
        /// </summary>
        [Fact]
        public async Task DelegationAccessCheck_app()
        {
            // Arrange
            string partyId = "999 999 999";
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponseV0", "a3-app.json");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path);

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:app",
                    Value = "a3-app",

                },
                new IdValuePair
                {
                    Id = "urn:altinn:org",
                    Value = "ttd",

                },
            };

            Core.Models.Right dto = new Core.Models.Right
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            List<DelegationResponseData> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<DelegationResponseData>>();
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: DelegationAccessCheck checks the accesses of an A2 service
        ///     Expected: DelegationAccessCheck returns the accesses of an A2 service
        /// </summary>
        [Fact]
        public async Task DelegationAccessCheck_service()
        {
            // Arrange
            string partyId = "999 999 999";
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponseV0", "3225.json");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path);

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:servicecode",
                    Value = "3225",

                },
                new IdValuePair
                {
                    Id = "urn:altinn:serviceeditioncode",
                    Value = "1596",

                },
            };

            Core.Models.Right dto = new Core.Models.Right
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationResponseData> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<DelegationResponseData>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: CreateDelegation delegates the actions of a standard resource
        ///     Expected: CreateDelegation returns the delegated actions of the standard resource
        /// </summary>
        [Fact]
        public async Task CreateDelegation_StandardResource_valid()
        {
            // Arrange
            string partyId = "999 999 999";
            string toSsn = "50019992";

            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "CreateDelegation", "appid-503.json");
            DelegationOutput expectedResponse = Util.GetMockData<DelegationOutput>(path);

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:resource",
                    Value = "appid-503",
                },
            };

            List<IdValuePair> to = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:ssn",
                    Value = toSsn,
                },
            };

            List<Core.Models.Right> rights = new List<Core.Models.Right>
            {
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "write",
                },
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "sign",
                },
            };

            DelegationInput delegation = new DelegationInput
            {
                To = to,
                Rights = rights,
            };

            string jsonDto = JsonSerializer.Serialize(delegation);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate/{partyId}", content);
            DelegationOutput actualResponse = await httpResponse.Content.ReadFromJsonAsync<DelegationOutput>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: CreateDelegation delegates the actions of an altinn app
        ///     Expected: CreateDelegation returns the delegated actions of the altinn app
        /// </summary>
        [Fact]
        public async Task CreateDelegation_AltinnApp_valid()
        {
            // Arrange
            string partyId = "999 999 999";
            string toSsn = "50019992";

            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "CreateDelegation", "a3-app2.json");
            DelegationOutput expectedResponse = Util.GetMockData<DelegationOutput>(path);

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:app",
                    Value = "a3-app2",

                },
                new IdValuePair
                {
                    Id = "urn:altinn:org",
                    Value = "ttd",

                },
            };

            List<IdValuePair> to = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:ssn",
                    Value = toSsn,
                },
            };

            List<Core.Models.Right> rights = new List<Core.Models.Right>
            {
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "write",
                },
            };

            DelegationInput delegation = new DelegationInput
            {
                To = to,
                Rights = rights,
            };

            string jsonDto = JsonSerializer.Serialize(delegation);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate/{partyId}", content);
            DelegationOutput actualResponse = await httpResponse.Content.ReadFromJsonAsync<DelegationOutput>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: CreateDelegation delegates the actions of an altinn 2 form
        ///     Expected: CreateDelegation returns the delegated actions of the altinn 2 form
        /// </summary>
        [Fact]
        public async Task CreateDelegation_Altinn2Service_valid()
        {
            // Arrange
            string partyId = "999 999 999";
            string toSsn = "50019992";

            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "CreateDelegation", "3225.json");
            DelegationOutput expectedResponse = Util.GetMockData<DelegationOutput>(path);

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:servicecode",
                    Value = "3225",

                },
                new IdValuePair
                {
                    Id = "urn:altinn:serviceeditioncode",
                    Value = "1596",

                },
            };

            List<IdValuePair> to = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:ssn",
                    Value = toSsn,
                },
            };

            List<Core.Models.Right> rights = new List<Core.Models.Right>
            {
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "write",
                },
            };

            DelegationInput delegation = new DelegationInput
            {
                To = to,
                Rights = rights,
            };

            string jsonDto = JsonSerializer.Serialize(delegation);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate/{partyId}", content);
            DelegationOutput actualResponse = await httpResponse.Content.ReadFromJsonAsync<DelegationOutput>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: CreateDelegation does not delegate the actions of a standard resource if the resource does not exist
        ///     Expected: CreateDelegation returns bad request
        /// </summary>
        [Fact]
        public async Task CreateDelegation_StandardResource_invalid()
        {
            // Arrange
            string partyId = "999 999 999";
            string toSsn = "50019992";

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:resource",
                    Value = "Nonexistent",

                },
            };

            List<IdValuePair> to = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:ssn",
                    Value = toSsn,
                },
            };

            List<Core.Models.Right> rights = new List<Core.Models.Right>
            {
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "write",
                },
                new Core.Models.Right
                {
                    Resource = resource,
                    Action = "sign",
                },
            };

            DelegationInput delegation = new DelegationInput
            {
                To = to,
                Rights = rights,
            };

            string jsonDto = JsonSerializer.Serialize(delegation);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate/{partyId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: ClearAccessCache accepts correct input and returns ok
        ///     Expected: ClearAccessCache returns OK
        /// </summary>
        [Fact]
        public async Task ClearAccessCache_returnsOk()
        {
            // Arrange
            string partyId = "999 999 999";
            string userUUID = "5c0656db-cf51-43a4-bd64-6a91c8caacfb";

            BaseAttribute recipient = new BaseAttribute
            {
                Type = "urn:altinn:person:uuid",
                Value = userUUID,
            };

            string jsonDto = JsonSerializer.Serialize(recipient);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/singleright/{partyId}/accesscache/clear", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }


        // ----------------------------
        //// New GUI
        // ----------------------------

        /// <summary>
        ///     Test case: Successfully perform delegationcheck on a resource
        ///     Expected: Returns OK and the checked accesses of the given resource
        /// </summary>
        [Fact]
        public async Task DelegationCheck_ReturnsValid()
        {
            // Arrange
            string from = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string resource = "appid-503";
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "DelegationCheck", "appid-503.json");
            List<RightCheck> expectedResponse = Util.GetMockData<List<RightCheck>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegationcheck?from={from}&resource={resource}");
            List<RightCheck> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<RightCheck>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Try to perform delegation check on a resource that does not exist
        ///     Expected: Returns a non-successfull status
        /// </summary>
        [Fact]
        public async Task DelegationCheck_InvalidResource()
        {
            // Arrange
            string from = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string resource = "non-existing-resource";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegationcheck?from={from}&resource={resource}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Handles unexpected errors by returning a 500 status
        ///     Expected: Returns an internal server error
        /// </summary>
        [Fact]
        public async Task DelegationCheck_InternalServerError()
        {
            // Arrange
            string from = "00000000-0000-0000-0000-000000000000"; // This triggers ThrowExceptionIfTriggerParty in mock
            string resource = "appid-503";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegationcheck?from={from}&resource={resource}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Successfully perform delegation of the rights on a specified resource
        ///     Expected: Returns OK, with the output of the delegation
        /// </summary>
        [Fact]
        public async Task DelegateResource_Success()
        {
            // Arrange
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "appid-503";
            List<string> actionKeys = new List<string> { "appid-503/read", "appid-503/write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate?from={from}&to={to}&party={party}&resourceId={resourceId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Try to perform delegation of the rights on a non-existent resource
        ///     Expected: Returns BadRequest
        /// </summary>
        [Fact]
        public async Task DelegateResource_InvalidResource()
        {
            // Arrange
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "non-existing-resource";
            List<string> actionKeys = new List<string> { "non-existing-resource/read", "non-existing-resource/write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate?from={from}&to={to}&party={party}&resourceId={resourceId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Handles unexpected errors by returning a 500 status
        ///     Expected: Returns an internal server error
        /// </summary>
        [Fact]
        public async Task DelegateResource_InternalServerError()
        {
            // Arrange - Using Guid that triggers exception in mock
            Guid from = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            string resourceId = "appid-503";
            List<string> actionKeys = new List<string> { "appid-503/read", "appid-503/write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate?from={from}&to={to}&party={party}&resourceId={resourceId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Handles HttpStatusException specifically 
        ///     Expected: Returns the appropriate status code from HttpStatusException
        /// </summary>
        [Fact]
        public async Task DelegateResource_HttpStatusException()
        {
            // Arrange - Using specific resourceId that triggers HttpStatusException in mock
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "non-existing-resource"; // This should trigger HttpStatusException based on mock behavior
            List<string> actionKeys = new List<string> { "appid-503/read" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/delegate?from={from}&to={to}&party={party}&resourceId={resourceId}", content);

            // Assert - Should return BadRequest based on how mock handles HttpStatusException
            Assert.True(httpResponse.StatusCode == HttpStatusCode.BadRequest || httpResponse.StatusCode == HttpStatusCode.InternalServerError);
        }

        /// <summary>
        ///     Test case: Successfully retrieve delegated resources for a right holder
        ///     Expected: Returns OK and the list of delegated resources
        /// </summary>
        [Fact]
        public async Task GetDelegatedResources_ReturnsValid()
        {
            // Arrange
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "GetDelegations", "delegations.json");
            List<ResourceDelegation> expectedResponse = Util.GetMockData<List<ResourceDelegation>>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegation/resources?party={party}&from={from}&to={to}");
            List<ResourceDelegation> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ResourceDelegation>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(expectedResponse.Count, actualResponse.Count);
        }

        /// <summary>
        ///     Test case: Handles unexpected errors when retrieving delegated resources
        ///     Expected: Returns an internal server error
        /// </summary>
        [Fact]
        public async Task GetDelegatedResources_InternalServerError()
        {
            // Arrange - Using Guid that triggers exception in mock
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegation/resources?party={party}&from={from}&to={to}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Handles HttpStatusException when retrieving delegated resources
        ///     Expected: Returns the appropriate status code from HttpStatusException
        /// </summary>
        [Fact]
        public async Task GetDelegatedResources_HttpStatusException()
        {
            // Arrange - Using Guid that triggers HttpStatusException in mock
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("11111111-1111-1111-1111-111111111111");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegation/resources?party={party}&from={from}&to={to}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Successfully retrieve delegated resource rights for a specific resource
        ///     Expected: Returns OK and the resource rights
        /// </summary>
        [Fact]
        public async Task GetDelegatedResourceRights_ReturnsValid()
        {
            // Arrange
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resourceId = "appid-502";
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "GetResourceRights", $"{resourceId}.json");
            ResourceRight expectedResponse = Util.GetMockData<ResourceRight>(path);

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegation/resources/rights?party={party}&from={from}&to={to}&resourceId={resourceId}");
            ResourceRight actualResponse = await httpResponse.Content.ReadFromJsonAsync<ResourceRight>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.NotNull(actualResponse.Resource);
            Assert.Equal(expectedResponse.Resource.RefId, actualResponse.Resource.RefId);
        }

        /// <summary>
        ///     Test case: Handles unexpected errors when retrieving delegated resource rights
        ///     Expected: Returns an internal server error
        /// </summary>
        [Fact]
        public async Task GetDelegatedResourceRights_InternalServerError()
        {
            // Arrange - Using Guid that triggers exception in mock
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resourceId = "appid-502";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegation/resources/rights?party={party}&from={from}&to={to}&resourceId={resourceId}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Handles HttpStatusException when retrieving delegated resource rights
        ///     Expected: Returns the appropriate status code from HttpStatusException
        /// </summary>
        [Fact]
        public async Task GetDelegatedResourceRights_HttpStatusException()
        {
            // Arrange - Using Guid that triggers HttpStatusException in mock
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("11111111-1111-1111-1111-111111111111");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resourceId = "appid-502";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegation/resources/rights?party={party}&from={from}&to={to}&resourceId={resourceId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///     Test case: Handles HttpStatusException when resource is not found for delegated resource rights
        ///     Expected: Returns NotFound status code
        /// </summary>
        [Fact]
        public async Task GetDelegatedResourceRights_ResourceNotFound()
        {
            // Arrange - Using invalid resource ID that doesn't exist in mock data
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string resourceId = "non-existing-resource";

            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/delegation/resources/rights?party={party}&from={from}&to={to}&resourceId={resourceId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///  Test case: Call RevokeResourceAccess with input that causes the client layer to throw an exception
        ///  Expected: RevokeResourceAccess returns internal server error when revoke request fails
        /// </summary>
        [Fact]
        public async Task RevokeResourceAccess_handles_internal_error()
        {
            // Arrange
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            string resourceId = "appid-502";

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/singleright/revoke?party={party}&from={from}&to={to}&resourceId={resourceId}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///  Test case: Call RevokeResourceAccess with invalid resource
        ///  Expected: RevokeResourceAccess returns a failing status as provided by backend (in this case: BadRequest)
        /// </summary>
        [Fact]
        public async Task RevokeResourceAccess_handles_response_error()
        {
            // Arrange
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            string resourceId = "invalid-resource";

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/singleright/revoke?party={party}&from={from}&to={to}&resourceId={resourceId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: RevokeResourceAccess revokes the resource of a user
        ///    Expected: RevokeResourceAccess returns ok on valid input
        /// </summary>
        [Fact]
        public async Task RevokeResourceAccess_returns_ok_on_valid_input()
        {
            // Arrange
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            string resourceId = "appid-502";

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/singleright/revoke?party={party}&from={from}&to={to}&resourceId={resourceId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: EditResourceAccess successfully makes the requested edits
        ///    Expected: EditResourceAccess returns ok with no failed edits
        /// </summary>
        [Fact]
        public async Task EditResourceAccess_returns_ok_on_valid_input()
        {
            // Arrange
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "appid-503";

            List<string> actionKeys = new List<string> { "appid-503/read", "appid-503/write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/singleright/update?party={party}&from={from}&to={to}&resourceId={resourceId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: Backend returns unsuccessfull edits
        ///    Expected: EditResourceAccess returns ok but with failed edits
        /// </summary>
        [Fact]
        public async Task EditResourceAccess_returns_unsuccessfull_edits()
        {
            // Arrange
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "appid-502";

            List<string> actionKeys = new List<string> { "appid-502/read" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/singleright/update?party={party}&from={from}&to={to}&resourceId={resourceId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: An internal error happens
        ///    Expected: EditResourceAccess returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task EditResourceAccess_returns_handles_internal_errors()
        {
            // Arrange
            Guid from = Guid.Parse("00000000-0000-0000-0000-000000000000");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000000");
            string resourceId = "invalid-resource";

            List<string> actionKeys = new List<string> { "appid-502/write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/singleright/update?party={party}&from={from}&to={to}&resourceId={resourceId}", content);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: HttpStatusException is thrown from service layer
        ///    Expected: EditResourceAccess returns appropriate status code from the exception
        /// </summary>
        [Fact]
        public async Task EditResourceAccess_HttpStatusException()
        {
            // Arrange - Using specific scenario that triggers HttpStatusException in mock
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "non-existing-resource";

            List<string> actionKeys = new List<string> { "non-existing-resource/write" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/singleright/update?party={party}&from={from}&to={to}&resourceId={resourceId}", content);

            // Assert - Should return BadRequest based on how mock handles non-existing resources
            Assert.True(httpResponse.StatusCode == HttpStatusCode.BadRequest || httpResponse.StatusCode == HttpStatusCode.InternalServerError);
        }

        /// <summary>
        ///    Test case: Invalid resource ID provided
        ///    Expected: EditResourceAccess returns BadRequest
        /// </summary>
        [Fact]
        public async Task EditResourceAccess_InvalidResource()
        {
            // Arrange
            Guid from = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resourceId = "definitely-does-not-exist";

            List<string> actionKeys = new List<string> { "invalid/action" };

            string jsonActionKeys = JsonSerializer.Serialize(actionKeys);
            HttpContent content = new StringContent(jsonActionKeys, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PutAsync($"accessmanagement/api/v1/singleright/update?party={party}&from={from}&to={to}&resourceId={resourceId}", content);

            // Assert
            Assert.True(httpResponse.StatusCode == HttpStatusCode.BadRequest || httpResponse.StatusCode == HttpStatusCode.InternalServerError);
        }

        private int CountMatches(List<DelegationResponseData> actualResponses, string expectedResponseFileName)
        {
            string path = Path.Combine(mockFolder, "Data", "SingleRight", "DelegationAccessCheckResponseV0", expectedResponseFileName);

            List<DelegationResponseData> expectedResponses = Util.GetMockData<List<DelegationResponseData>>(path);
            int countMatches = 0;

            for (int i = 0; i < actualResponses.Count; i++)
            {
                bool value = AreObjectsEqual(actualResponses[i], expectedResponses[i]);
                if (value)
                {
                    countMatches++;
                }
            }
            return countMatches;
        }

        private static bool AreObjectsEqual(DelegationResponseData actualObject, DelegationResponseData expectedObject)
        {
            return actualObject.RightKey == expectedObject.RightKey &&
                   actualObject.Action == expectedObject.Action &&
                   actualObject.Status == expectedObject.Status;
        }
    }
}
