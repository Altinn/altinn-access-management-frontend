using System.Net;
using System.Net.Http.Headers;
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
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<SingleRightController> _factory;
        private readonly string unitTestFolder;
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
            unitTestFolder = Path.GetDirectoryName(new Uri(typeof(SingleRightClientMock).Assembly.Location).LocalPath);

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
            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponse");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path, "appid-503.json");

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
            List<DelegationResponseData> actualResponse = await httpResponse.Content.ReadAsAsync<List<DelegationResponseData>>();

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
            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponse");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path, "a3-app.json");

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
            List<DelegationResponseData> actualResponse = await httpResponse.Content.ReadAsAsync<List<DelegationResponseData>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
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
            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "SingleRight", "DelegationAccessCheckResponse");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(path, "3225.json");

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
            List<DelegationResponseData> actualResponse = await httpResponse.Content.ReadAsAsync<List<DelegationResponseData>>();

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

            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "SingleRight", "CreateDelegation");
            DelegationOutput expectedResponse = Util.GetMockData<DelegationOutput>(path, "appid-503.json");

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
            DelegationOutput actualResponse = await httpResponse.Content.ReadAsAsync<DelegationOutput>();

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

            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "SingleRight", "CreateDelegation");
            DelegationOutput expectedResponse = Util.GetMockData<DelegationOutput>(path, "a3-app2.json");

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
            DelegationOutput actualResponse = await httpResponse.Content.ReadAsAsync<DelegationOutput>();

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

            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "SingleRight", "CreateDelegation");
            DelegationOutput expectedResponse = Util.GetMockData<DelegationOutput>(path, "3225.json");

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
            DelegationOutput actualResponse = await httpResponse.Content.ReadAsAsync<DelegationOutput>();

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

        private int CountMatches(List<DelegationResponseData> actualResponses, string expectedResponseFileName)
        {
            string path = Path.Combine(unitTestFolder, "Data", "SingleRight", "DelegationAccessCheckResponse");

            List<DelegationResponseData> expectedResponses = Util.GetMockData<List<DelegationResponseData>>(path, expectedResponseFileName);
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
