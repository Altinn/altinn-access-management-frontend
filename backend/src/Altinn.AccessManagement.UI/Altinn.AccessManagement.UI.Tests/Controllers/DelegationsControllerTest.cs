using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Tests.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="DelegationsController"></see>
    /// </summary>
    [Collection("DelegationController Tests")]
    public class DelegationsControllerTest : IClassFixture<CustomWebApplicationFactory<DelegationsController>>
    {
        private readonly CustomWebApplicationFactory<DelegationsController> _factory;
        private readonly HttpClient _client;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public DelegationsControllerTest(CustomWebApplicationFactory<DelegationsController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        /// <summary>
        /// Test case: GetAllReceivedDelegations returns a list of delegations received by the reortee
        /// Expected: GetAllReceivedDelegations returns a list of delegations
        /// </summary>
        [Fact]
        public async Task GetAllReceivedDelegations_Valid_CoveredBy()
        {
            // Arrange
            List<DelegationsFE> expectedDelegations = GetExpectedInboundDelegationsForParty(50004219);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004219/delegations/maskinportenschema/received");
            string responseContent = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };
            List<DelegationsFE> actualDelegations = JsonSerializer.Deserialize<List<DelegationsFE>>(responseContent, options);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertDelegationEqual);
        }

        /// <summary>
        /// Test case: GetAllReceivedDelegations returns emptylist when there are no delegations for the reportee
        /// Expected: GetAllReceivedDelegations returns empty list 
        /// </summary>
        [Fact]
        public async Task GetAllReceivedDelegations_NoDelegations()
        {
            // Arrange
            string expected = "[]";

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004223/delegations/maskinportenschema/received");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(expected, responseContent);
        }

        private static List<DelegationsFE> GetExpectedInboundDelegationsForParty(int covererdByPartyId)
        {
            List<DelegationsFE> inboundDelegations = new List<DelegationsFE>();
            inboundDelegations = TestDataUtil.GetDelegationsFE(0, covererdByPartyId);
            return inboundDelegations;
        }

        /// <summary>
        /// Test case: GetAllOffereddDelegations returns a list of delegations offered by the reportee
        /// Expected: GetAllOfferedDelegations returns a list of delegations
        /// </summary>
        [Fact]
        public async Task GetAllOfferedDelegations_Valid_OfferedBy()
        {
            // Arrange
            List<DelegationsFE> expectedDelegations = GetExpectedOutboundDelegationsForParty(50004223);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004223/delegations/maskinportenschema/offered");
            string responseContent = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };
            List<DelegationsFE> actualDelegations = JsonSerializer.Deserialize<List<DelegationsFE>>(responseContent, options);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertCollections(expectedDelegations, actualDelegations, AssertionUtil.AssertDelegationEqual);
        }

        /// <summary>
        /// Test case: GetAllOffereddDelegations returns emptylist when there are no delegations for the reportee
        /// Expected: GetAllOfferedDelegations returns empty list 
        /// </summary>
        [Fact]
        public async Task GetAllOfferedDelegations_NoDelegations()
        {
            // Arrange
            string expected = "[]";

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/50004219/delegations/maskinportenschema/offered");
            string responseContent = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(expected, responseContent);
        }

        private static List<DelegationsFE> GetExpectedOutboundDelegationsForParty(int offeredByPartyId)
        {
            List<DelegationsFE> outboundDelegations = new List<DelegationsFE>();
            outboundDelegations = TestDataUtil.GetDelegationsFE(offeredByPartyId, 0);
            return outboundDelegations;
        }
    }
}
