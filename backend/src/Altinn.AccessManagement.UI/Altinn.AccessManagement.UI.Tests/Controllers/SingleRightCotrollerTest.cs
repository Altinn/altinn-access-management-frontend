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
    ///     Test class for <see cref="SingleRightCotrollerTest"></see>
    /// </summary>
    [Collection("SingleRightCotrollerTest")]
    public class SingleRightCotrollerTest : IClassFixture<CustomWebApplicationFactory<SingleRightController>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<SingleRightController> _factory;
        private readonly string unitTestFolder;
        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public SingleRightCotrollerTest(CustomWebApplicationFactory<SingleRightController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetSingleRightTestClient(factory);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            unitTestFolder = Path.GetDirectoryName(new Uri(typeof(SingleRightClientMock).Assembly.Location).LocalPath);

        }

        /// <summary>
        ///     Method that checks at least 3 of the potential responses matches at least 3 of the responses in the mocked
        ///     response.
        /// </summary>
        [Fact]
        public async Task DelegationAccessCheck_AllAccesses_valid_response()
        {
            // Arrange
            string partyId = "999 999 999";

            IdValuePair attribute = new IdValuePair
            {
                Id = "urn:altinn:resource",
                Value = "appid-503",
            };

            List<IdValuePair> resource = new List<IdValuePair>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationResponseData> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationResponseData>>();
            int countMatches = CountMatches(actualResponses, "AllAccessesAppid503.json");

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }

        [Fact]
        public async Task DelegationAccessCheck_NoAccesses_valid_response()
        {
            // Arrange
            string partyId = "999 999 999";

            IdValuePair attribute = new IdValuePair
            {
                Id = "urn:altinn:resource",
                Value = "appid-504",
            };

            List<IdValuePair> resource = new List<IdValuePair>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationResponseData> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationResponseData>>();
            int countMatches = CountMatches(actualResponses, "NoAccessesAppid504.json");

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }

        [Fact]
        public async Task DelegationAccessCheck_OnlyRead_valid_response()
        {
            // Arrange
            string partyId = "999 999 999";

            IdValuePair attribute = new IdValuePair
            {
                Id = "urn:altinn:resource",
                Value = "appid-505",
            };

            List<IdValuePair> resource = new List<IdValuePair>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationResponseData> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationResponseData>>();
            int countMatches = CountMatches(actualResponses, "OnlyReadAppid505.json");

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }

        [Fact]
        public async Task DelegationAccessCheck_ReadAndWrite_valid_response()
        {
            // Arrange
            string partyId = "999 999 999";

            IdValuePair attribute = new IdValuePair
            {
                Id = "urn:altinn:resource",
                Value = "appid-506",
            };

            List<IdValuePair> resource = new List<IdValuePair>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationResponseData> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationResponseData>>();
            int countMatches = CountMatches(actualResponses, "ReadAndWriteAppid506.json");

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
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

            List<DelegationRequestDto> rights = new List<DelegationRequestDto>
            {
                new DelegationRequestDto
                {
                    Resource = resource,
                    Action = "read",
                },
                new DelegationRequestDto
                {
                    Resource = resource,
                    Action = "write",
                },
                new DelegationRequestDto
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
            AssertionUtil.AssertDelegationOutputEqual(expectedResponse, actualResponse);
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
                    Id = "urn:altinn:applicationid",
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

            List<DelegationRequestDto> rights = new List<DelegationRequestDto>
            {
                new DelegationRequestDto
                {
                    Resource = resource,
                    Action = "read",
                },
                new DelegationRequestDto
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
            AssertionUtil.AssertDelegationOutputEqual(expectedResponse, actualResponse);
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

            List<DelegationRequestDto> rights = new List<DelegationRequestDto>
            {
                new DelegationRequestDto
                {
                    Resource = resource,
                    Action = "read",
                },
                new DelegationRequestDto
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
            AssertionUtil.AssertDelegationOutputEqual(expectedResponse, actualResponse);
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

            List<DelegationRequestDto> rights = new List<DelegationRequestDto>
            {
                new DelegationRequestDto
                {
                    Resource = resource,
                    Action = "read",
                },
                new DelegationRequestDto
                {
                    Resource = resource,
                    Action = "write",
                },
                new DelegationRequestDto
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
