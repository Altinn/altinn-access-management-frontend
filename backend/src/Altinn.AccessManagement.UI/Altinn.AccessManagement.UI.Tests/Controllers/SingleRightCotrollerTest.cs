using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;
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

        [Fact]
        public async Task UserDelegationAccessCheck_valid_response()
        {
            // Arrange
            string partyId = "50004223";

            CheckDelegationAccessDto dto = new CheckDelegationAccessDto
            {
                To = new To("urn:altinn:organizationnumber", "123456789"),
                Resource = new Resource("urn:altinn:resource", "testapi"),
            };
            string jsonDto = JsonSerializer.Serialize(dto);
            HttpContent content = new StringContent(jsonDto, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/singleright/checkdelegationaccesses/{partyId}", content);
            List<DelegationAccessCheckResponse> actualResponses = await httpResponse.Content.ReadAsAsync<List<DelegationAccessCheckResponse>>();
            int countMatches = CountMatches(actualResponses);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
            Assert.Equal(3, countMatches);
        }
        private int CountMatches(List<DelegationAccessCheckResponse> actualResponses)
        {

            int countMatches = 0;
            foreach (AccessLevel accessLevel in Enum.GetValues(typeof(AccessLevel)))
            {
                List<DelegationAccessCheckResponse> expectedResponses = SingleRightUtil.GetMockedDelegationAccessCheckResponses(accessLevel);
                countMatches = 0;
                for (int i = 0; i < actualResponses.Count; i++)
                {
                    bool value = AreObjectsEqual(actualResponses[i], expectedResponses[i]);
                    if (value)
                    {
                        countMatches++;
                    }
                }
                if (countMatches == 3)
                {
                    break;
                }
            }
            return countMatches;
        }

        private bool AreObjectsEqual(DelegationAccessCheckResponse actualObject, DelegationAccessCheckResponse expectedObject)
        {
            return actualObject.RightKey == expectedObject.RightKey &&
                   actualObject.Action == expectedObject.Action &&
                   actualObject.FaultCode == expectedObject.FaultCode &&
                   actualObject.Reason == expectedObject.Reason &&
                   actualObject.Status == expectedObject.Status;
        }
    }
}
