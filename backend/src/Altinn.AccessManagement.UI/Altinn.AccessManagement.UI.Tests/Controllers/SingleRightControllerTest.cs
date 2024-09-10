using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
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
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponse", "appid-503.json");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path);

            List<IdValuePair> resource = new List<IdValuePair>
            {
                new IdValuePair
                {
                    Id = "urn:altinn:resource",
                    Value = "appid-503",
                }
            };

            Right dto = new Right
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
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponse", "a3-app.json");
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

            Right dto = new Right
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
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponse", "3225.json");
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

            Right dto = new Right
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

            List<Right> rights = new List<Right>
            {
                new Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Right
                {
                    Resource = resource,
                    Action = "write",
                },
                new Right
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

            List<Right> rights = new List<Right>
            {
                new Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Right
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
        /// Test case: GetSingleRightsForUser returns the single-rights for a user
        /// Expected: GetSingleRightsForUser returns the single-rights for a user
        /// </summary>
        [Fact]
        public async Task GetSingleRightsForUser_returnsExpectedRights()
        {
            // Arrange
            string partyId = "999 999 999";
            string userUUID = "5c0656db-cf51-43a4-bd64-6a91c8caacfb";

            // Expected response data
            string path = Path.Combine(mockFolder, "Data", "ExpectedResults", "SingleRight", "GetDelegations", "List.json");
            List<ServiceResource> expectedResponse = Util.GetMockData<List<ServiceResource>>(path);


            // Act
            HttpResponseMessage httpResponse = await _client.GetAsync($"accessmanagement/api/v1/singleright/{partyId}/rightholder/{userUUID}");
            List<ServiceResource> actualResponse = await httpResponse.Content.ReadFromJsonAsync<List<ServiceResource>>();


            // Assert
            Assert.Equal(expectedResponse.Count, actualResponse.Count);
            foreach (var right in expectedResponse)
            {
                Assert.Contains(actualResponse, r => r.Identifier  == right.Identifier);
            }
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

            List<Right> rights = new List<Right>
            {
                new Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Right
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

            List<Right> rights = new List<Right>
            {
                new Right
                {
                    Resource = resource,
                    Action = "read",
                },
                new Right
                {
                    Resource = resource,
                    Action = "write",
                },
                new Right
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

        private int CountMatches(List<DelegationResponseData> actualResponses, string expectedResponseFileName)
        {
            string path = Path.Combine(mockFolder, "Data", "SingleRight", "DelegationAccessCheckResponse", expectedResponseFileName);

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
