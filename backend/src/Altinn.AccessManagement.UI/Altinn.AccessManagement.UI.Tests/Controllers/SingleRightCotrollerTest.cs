using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
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

            AttributeMatch attribute = new AttributeMatch
            {
                Id = "urn:altinn:resource",
                Value = "appid-503",
            };

            List<AttributeMatch> resource = new List<AttributeMatch>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationAccessCheckResponse> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationAccessCheckResponse>>();
            int countMatches = CountMatches(actualResponses, AccessLevel.AllAccessesAppid503);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }
        
        [Fact]
        public async Task DelegationAccessCheck_NoAccesses_valid_response()
        {
            // Arrange
            string partyId = "999 999 999";

            AttributeMatch attribute = new AttributeMatch
            {
                Id = "urn:altinn:resource",
                Value = "appid-504",
            };

            List<AttributeMatch> resource = new List<AttributeMatch>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationAccessCheckResponse> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationAccessCheckResponse>>();
            int countMatches = CountMatches(actualResponses, AccessLevel.NoAccessesAppid504);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }

        [Fact]
        public async Task DelegationAccessCheck_OnlyRead_valid_response()
        {
            // Arrange
            string partyId = "999 999 999";

            AttributeMatch attribute = new AttributeMatch
            {
                Id = "urn:altinn:resource",
                Value = "appid-505",
            };

            List<AttributeMatch> resource = new List<AttributeMatch>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationAccessCheckResponse> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationAccessCheckResponse>>();
            int countMatches = CountMatches(actualResponses, AccessLevel.OnlyReadAppid505);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }
        
        [Fact]
        public async Task DelegationAccessCheck_ReadAndWrite_valid_response()
        {
            // Arrange
            string partyId = "999 999 999";

            AttributeMatch attribute = new AttributeMatch
            {
                Id = "urn:altinn:resource",
                Value = "appid-506",
            };

            List<AttributeMatch> resource = new List<AttributeMatch>();
            resource.Add(attribute);
            DelegationRequestDto dto = new DelegationRequestDto
            {
                Resource = resource,
            };

            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationAccessCheckResponse> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationAccessCheckResponse>>();
            int countMatches = CountMatches(actualResponses, AccessLevel.ReadAndWriteAppid506);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }
        
        private int CountMatches(List<DelegationAccessCheckResponse> actualResponses, AccessLevel expectedAccessLevel)
        {

            int countMatches = 0;

            List<DelegationAccessCheckResponse> expectedResponses = SingleRightUtil.GetMockedDelegationAccessCheckResponses(expectedAccessLevel);
            countMatches = 0;
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

        private static bool AreObjectsEqual(DelegationAccessCheckResponse actualObject, DelegationAccessCheckResponse expectedObject)
        {
            return actualObject.RightKey == expectedObject.RightKey &&
                   actualObject.Action == expectedObject.Action &&
                   actualObject.FaultCode == expectedObject.FaultCode &&
                   actualObject.Reason == expectedObject.Reason &&
                   actualObject.Status == expectedObject.Status;
        }
    }
}
