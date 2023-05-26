using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Tests.Utils;
using Azure;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="MaskinportenSchemaController"></see>
    /// </summary>
    [Collection("MaskinportenSchemaController Tests")]
    public class MaskinportenSchemaControllerTest : IClassFixture<CustomWebApplicationFactory<MaskinportenSchemaController>>
    {
        private readonly CustomWebApplicationFactory<MaskinportenSchemaController> _factory;
        private readonly HttpClient _client;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public MaskinportenSchemaControllerTest(CustomWebApplicationFactory<MaskinportenSchemaController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        /// <summary>
        /// Test case: GetReceivedMaskinportenSchemaDelegations returns a list of delegations received by the reortee
        /// Expected: GetReceivedMaskinportenSchemaDelegations returns a list of delegations
        /// </summary>
        [Fact]
        public async Task GetReceivedMaskinportenSchemaDelegations_Valid_CoveredBy()
        {
            // Arrange
            List<MaskinportenSchemaDelegationFE> expectedDelegations = GetExpectedInboundDelegationsForParty(50004219);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004219/maskinportenschema/received");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<MaskinportenSchemaDelegationFE> actualDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegationFE>>(responseContent, options);
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertMaskinportenSchemaDelegationFEEqual);
        }

        /// <summary>
        /// Test case: GetReceivedMaskinportenSchemaDelegations returns emptylist when there are no delegations for the reportee
        /// Expected: GetReceivedMaskinportenSchemaDelegations returns empty list 
        /// </summary>
        [Fact]
        public async Task GetReceivedMaskinportenSchemaDelegations_NoDelegations()
        {
            // Arrange
            string expected = "[]";

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004223/maskinportenschema/received");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(expected, responseContent);
        }

        private static List<MaskinportenSchemaDelegationFE> GetExpectedInboundDelegationsForParty(int covererdByPartyId)
        {
            List<MaskinportenSchemaDelegationFE> inboundDelegations = new List<MaskinportenSchemaDelegationFE>();
            inboundDelegations = TestDataUtil.GetDelegationsFE(0, covererdByPartyId);
            return inboundDelegations;
        }

        /// <summary>
        /// Test case: GetOfferedMaskinportenSchemaDelegations returns a list of delegations offered by the reportee
        /// Expected: GetOfferedMaskinportenSchemaDelegations returns a list of delegations
        /// </summary>
        [Fact]
        public async Task GetOfferedMaskinportenSchemaDelegations_Valid_OfferedBy()
        {
            // Arrange
            List<MaskinportenSchemaDelegationFE> expectedDelegations = GetExpectedOutboundDelegationsForParty(50004223);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004223/maskinportenschema/offered");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<MaskinportenSchemaDelegationFE> actualDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegationFE>>(responseContent, options);
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertMaskinportenSchemaDelegationFEEqual);
        }

        /// <summary>
        /// Test case: GetOfferedMaskinportenSchemaDelegations returns emptylist when there are no delegations for the reportee
        /// Expected: GetOfferedMaskinportenSchemaDelegations returns empty list 
        /// </summary>
        [Fact]
        public async Task GetOfferedMaskinportenSchemaDelegations_NoDelegations()
        {
            // Arrange
            string expected = "[]";

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004219/maskinportenschema/offered");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(expected, responseContent);
        }

        /// <summary>
        /// Test case: MaskinportenDelegation performed by authenticated user 20000490 for the reportee party 50005545 of the nav_aa_distribution maskinporten schema resource from the resource registry, to the organization 810418672
        ///            In this case:
        ///            - The user 20000490 is DAGL for the From unit 50005545
        /// Expected: MaskinportenDelegation returns 200 OK with response body containing the expected delegated rights
        /// </summary>
        [Fact]
        public async Task PostMaskinportenSchemaDelegation_DAGL_Success()
        {
            // Arrange
            string fromParty = "50005545";
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(20000490, 50002598));

            DelegationOutput expectedResponse = GetExpectedResponse("Delegation", "nav_aa_distribution", $"p{fromParty}", "810418672");
            StreamContent requestContent = GetRequestContent("Delegation", "nav_aa_distribution", $"p{fromParty}", "810418672");

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered", requestContent);
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            DelegationOutput actualResponse = JsonSerializer.Deserialize<DelegationOutput>(responseContent, options);
            AssertionUtil.AssertDelegationOutputEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: RevokeOfferedMaskinportenScopeDelegation for the reportee party 50004222 of the nav_aa_distribution maskinporten schema resource from the resource registry,
        ///            delegated to the organization 810418192
        /// Expected: RevokeOfferedMaskinportenScopeDelegation returns 204 No Content
        /// </summary>
        [Fact]
        public void RevokeOfferedMaskinportenScopeDelegation_Success()
        {
            // Arrange
            string fromParty = "50004223";
            StreamContent requestContent0 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent1 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent2 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent3 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent4 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent5 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent6 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent7 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent8 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");
            StreamContent requestContent9 = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");

            HttpResponseMessage response0 = null, response1 = null, response2 = null, response3 = null, response4 = null, response5 = null, response6 = null, response7 = null, response8 = null, response9 = null;

            // Act
            Task.Run(() => response0 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent0).Result);
            Task.Run(() => response1 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent1).Result);
            Task.Run(() => response2 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent2).Result);
            Task.Run(() => response3 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent3).Result);
            Task.Run(() => response4 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent4).Result);
            Task.Run(() => response5 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent5).Result);
            Task.Run(() => response6 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent6).Result);
            Task.Run(() => response7 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent7).Result);
            Task.Run(() => response8 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent8).Result);
            Task.Run(() => response9 = _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent9).Result);

            // Assert
            int count = 0;
            while (response0 == null || response1 == null || response2 == null || response3 == null || response4 == null || response5 == null || response6 == null || response7 == null || response8 == null || response9 == null)
            {
                Thread.Sleep(10);
                count++;

                if (count == 1000)
                {
                    Assert.Fail("Waited for a total of 10s and all requests still not complete");
                }
            }

            Assert.True(response0.StatusCode == HttpStatusCode.NoContent, $"response0 failed: {response0.StatusCode} | {response0.Content.ReadAsStringAsync().Result}");
            Assert.True(response1.StatusCode == HttpStatusCode.NoContent, $"response1 failed: {response1.StatusCode} | {response1.Content.ReadAsStringAsync().Result}");
            Assert.True(response2.StatusCode == HttpStatusCode.NoContent, $"response2 failed: {response2.StatusCode} | {response2.Content.ReadAsStringAsync().Result}");
            Assert.True(response3.StatusCode == HttpStatusCode.NoContent, $"response3 failed: {response3.StatusCode} | {response3.Content.ReadAsStringAsync().Result}");
            Assert.True(response4.StatusCode == HttpStatusCode.NoContent, $"response4 failed: {response4.StatusCode} | {response4.Content.ReadAsStringAsync().Result}");
            Assert.True(response5.StatusCode == HttpStatusCode.NoContent, $"response5 failed: {response5.StatusCode} | {response5.Content.ReadAsStringAsync().Result}");
            Assert.True(response6.StatusCode == HttpStatusCode.NoContent, $"response6 failed: {response6.StatusCode} | {response6.Content.ReadAsStringAsync().Result}");
            Assert.True(response7.StatusCode == HttpStatusCode.NoContent, $"response7 failed: {response7.StatusCode} | {response7.Content.ReadAsStringAsync().Result}");
            Assert.True(response8.StatusCode == HttpStatusCode.NoContent, $"response8 failed: {response8.StatusCode} | {response8.Content.ReadAsStringAsync().Result}");
            Assert.True(response9.StatusCode == HttpStatusCode.NoContent, $"response9 failed: {response9.StatusCode} | {response9.Content.ReadAsStringAsync().Result}");
        }

        /// <summary>
        /// Test case: RevokeReceivedMaskinportenScopeDelegation for the reportee party 50004221 of the nav_aa_distribution maskinporten schema resource from the resource registry,
        ///            which have received delegation from the organization 50004222
        /// Expected: RevokeReceivedMaskinportenScopeDelegation returns 204 No Content
        /// </summary>
        [Fact]
        public async Task RevokeReceivedMaskinportenScopeDelegation_Success()
        {
            // Arrange
            string toParty = "50004219";
            StreamContent requestContent = GetRequestContent("RevokeReceived", "nav_aa_distribution", $"810418672", $"p{toParty}");

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/{toParty}/maskinportenschema/received/revoke", requestContent);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        private static List<MaskinportenSchemaDelegationFE> GetExpectedOutboundDelegationsForParty(int offeredByPartyId)
        {
            List<MaskinportenSchemaDelegationFE> outboundDelegations = new List<MaskinportenSchemaDelegationFE>();
            outboundDelegations = TestDataUtil.GetDelegationsFE(offeredByPartyId, 0);
            return outboundDelegations;
        }

        private static StreamContent GetRequestContent(string operation, string resourceId, string from, string to, string inputFileName = "Input_Default")
        {
            Stream dataStream = File.OpenRead($"Data/MaskinportenSchema/{operation}/{resourceId}/from_{from}/to_{to}/{inputFileName}.json");
            StreamContent content = new StreamContent(dataStream);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            return content;
        }

        private static DelegationOutput GetExpectedResponse(string operation, string resourceId, string from, string to, string responseFileName = "ExpectedOutput_Default")
        {
            string responsePath = $"Data/MaskinportenSchema/{operation}/{resourceId}/from_{from}/to_{to}/{responseFileName}.json";
            string content = File.ReadAllText(responsePath);
            return (DelegationOutput)JsonSerializer.Deserialize(content, typeof(DelegationOutput), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
    }
}
