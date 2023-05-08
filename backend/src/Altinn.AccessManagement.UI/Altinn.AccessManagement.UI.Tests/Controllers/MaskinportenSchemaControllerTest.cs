using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Tests.Utils;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="MaskinportenSchemaController"></see>
    /// </summary>
    [Collection("DelegationController Tests")]
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
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertDelegationEqual);
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
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertDelegationEqual);
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

        private static List<MaskinportenSchemaDelegationFE> GetExpectedOutboundDelegationsForParty(int offeredByPartyId)
        {
            List<MaskinportenSchemaDelegationFE> outboundDelegations = new List<MaskinportenSchemaDelegationFE>();
            outboundDelegations = TestDataUtil.GetDelegationsFE(offeredByPartyId, 0);
            return outboundDelegations;
        }
    }
}
