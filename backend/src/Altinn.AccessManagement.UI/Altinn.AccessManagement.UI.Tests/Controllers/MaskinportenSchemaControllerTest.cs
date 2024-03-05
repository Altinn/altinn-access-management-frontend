using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Azure.Core;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for <see cref="MaskinportenSchemaController"></see>
    /// </summary>
    [Collection("MaskinportenSchemaController Tests")]
    public class MaskinportenSchemaControllerTest : IClassFixture<CustomWebApplicationFactory<MaskinportenSchemaController>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<MaskinportenSchemaController> _factory;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string unitTestFolder;

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public MaskinportenSchemaControllerTest(CustomWebApplicationFactory<MaskinportenSchemaController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            unitTestFolder = Path.GetDirectoryName(new Uri(typeof(MaskinportenSchemaControllerTest).Assembly.Location).LocalPath);
        }

        /// <summary>
        ///     Test case: GetReceivedMaskinportenSchemaDelegations returns a list of delegations received by the reortee
        ///     Expected: GetReceivedMaskinportenSchemaDelegations returns a list of delegations
        /// </summary>
        [Fact]
        public async Task GetReceivedMaskinportenSchemaDelegations_Valid_CoveredBy()
        {
            // Arrange
            List<MaskinportenSchemaDelegationFE> expectedDelegations = GetExpectedInboundDelegationsForParty(50004219);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/50004219/maskinportenschema/received");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<MaskinportenSchemaDelegationFE> actualDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegationFE>>(responseContent, options);
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetReceivedMaskinportenSchemaDelegations returns emptylist when there are no delegations for the
        ///     reportee
        ///     Expected: GetReceivedMaskinportenSchemaDelegations returns empty list
        /// </summary>
        [Fact]
        public async Task GetReceivedMaskinportenSchemaDelegations_NoDelegations()
        {
            // Arrange
            string expected = "[]";

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/50004223/maskinportenschema/received");
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
        ///     Test case: GetOfferedMaskinportenSchemaDelegations returns a list of delegations offered by the reportee
        ///     Expected: GetOfferedMaskinportenSchemaDelegations returns a list of delegations
        /// </summary>
        [Fact]
        public async Task GetOfferedMaskinportenSchemaDelegations_Valid_OfferedBy()
        {
            // Arrange
            List<MaskinportenSchemaDelegationFE> expectedDelegations = GetExpectedOutboundDelegationsForParty(50004223);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/50004223/maskinportenschema/offered");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<MaskinportenSchemaDelegationFE> actualDelegations = JsonSerializer.Deserialize<List<MaskinportenSchemaDelegationFE>>(responseContent, options);
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: GetOfferedMaskinportenSchemaDelegations returns emptylist when there are no delegations for the reportee
        ///     Expected: GetOfferedMaskinportenSchemaDelegations returns empty list
        /// </summary>
        [Fact]
        public async Task GetOfferedMaskinportenSchemaDelegations_NoDelegations()
        {
            // Arrange
            string expected = "[]";

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/50004219/maskinportenschema/offered");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(expected, responseContent);
        }

        /// <summary>
        ///     Test case: MaskinportenDelegation performed by authenticated user 20000490 for the reportee party 50005545 of the
        ///     nav_aa_distribution maskinporten schema resource from the resource registry, to the organization 810418672
        ///     In this case:
        ///     - The user 20000490 is DAGL for the From unit 50005545
        ///     Expected: MaskinportenDelegation returns 200 OK with response body containing the expected delegated rights
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
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        ///     Test case: RevokeOfferedMaskinportenScopeDelegation for the reportee party 50004222 of the nav_aa_distribution
        ///     maskinporten schema resource from the resource registry,
        ///     delegated to the organization 810418192
        ///     Expected: RevokeOfferedMaskinportenScopeDelegation returns 204 No Content
        /// </summary>
        [Fact]
        public async Task RevokeOfferedMaskinportenScopeDelegation_Success()
        {
            // Arrange
            string fromParty = "50004223";
            StreamContent requestContent = GetRequestContent("RevokeOffered", "nav_aa_distribution", $"p{fromParty}", "810418192");

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/{fromParty}/maskinportenschema/offered/revoke", requestContent);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        ///     Test case: RevokeReceivedMaskinportenScopeDelegation for the reportee party 50004221 of the nav_aa_distribution
        ///     maskinporten schema resource from the resource registry,
        ///     which have received delegation from the organization 50004222
        ///     Expected: RevokeReceivedMaskinportenScopeDelegation returns 204 No Content
        /// </summary>
        [Fact]
        public async Task RevokeReceivedMaskinportenScopeDelegation_Success()
        {
            // Arrange
            string toParty = "50004219";
            StreamContent requestContent = GetRequestContent("RevokeReceived", "nav_aa_distribution", "810418672", $"p{toParty}");

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/{toParty}/maskinportenschema/received/revoke", requestContent);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Tests if resource is delegable
        ///     Expected: Resource is delegable
        /// </summary>
        [Fact]
        public async Task DelegationCheck_HasDelegableRights()
        {
            // Arrange
            int reporteePartyId = 50076002;
            string resourceId = "default";
                
            string folderPath = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "MaskinportenSchema", "DelegationCheck", "scope-access-schema");
            string fullPath = Path.Combine(folderPath, resourceId + ".json");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(fullPath);

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/{reporteePartyId}/maskinportenschema/delegationcheck", Util.GetRequestWithHeader(Path.Combine(folderPath, $"request-{resourceId}.json")));
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            List<DelegationResponseData> actualResponse = JsonSerializer.Deserialize<List<DelegationResponseData>>(responseContent, options);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }
        
        /// <summary>
        ///     Test case: Tests if response has insufficient access level
        ///     Expected: Resource has insufficient access level
        /// </summary>
        [Fact]
        public async Task DelegationCheck_InsufficientAccessLevel()
        {
            // Arrange
            int reporteePartyId = 50067798;
            string resourceId = "appid-136";


            string folderPath = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "MaskinportenSchema", "DelegationCheck", "scope-access-schema");
            string fullPath = Path.Combine(folderPath, resourceId + ".json");
            List<DelegationResponseData> expectedResponse = Util.GetMockData<List<DelegationResponseData>>(fullPath);

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/{reporteePartyId}/maskinportenschema/delegationcheck", Util.GetRequestWithHeader(Path.Combine(folderPath, $"request-{resourceId}.json")));
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            List<DelegationResponseData> actualResponse = JsonSerializer.Deserialize<List<DelegationResponseData>>(responseContent, options);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
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
