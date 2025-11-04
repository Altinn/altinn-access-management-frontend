using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

// ReSharper disable InconsistentNaming

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for RoleController
    /// </summary>
    [Collection("RoleController Tests")]
    public class RoleControllerTest : IClassFixture<CustomWebApplicationFactory<RoleController>>
    {
        private readonly HttpClient _client;
        private readonly HttpClient _clientFeatureOff;
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private const string ExpectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public RoleControllerTest(CustomWebApplicationFactory<RoleController> factory)
        {
            _client = SetupUtils.GetTestClient(factory, null);
            _clientFeatureOff = SetupUtils.GetTestClient(factory, new FeatureFlags { DisplayLimitedPreviewLaunch = false });
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            ConfigureClient(_client, token);
            ConfigureClient(_clientFeatureOff, token);
        }

        private static void ConfigureClient(HttpClient client, string token)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        [Fact]
        public async Task GetConnections_ReturnsExpectedConnections()
        {
            Guid party = new("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid from = new("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = new("167536b5-f8ed-4c5a-8f48-0279507e53ae");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/connections?party={party}&from={from}&to={to}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<RolePermission> actual = JsonSerializer.Deserialize<List<RolePermission>>(await response.Content.ReadAsStringAsync(), _serializerOptions);
            List<RolePermission> expected = Util.GetMockData<List<RolePermission>>($"{ExpectedDataPath}/Role/Connections/{from}_{to}.json");

            Assert.NotNull(actual);
            Assert.Equal(expected.Count, actual.Count);
            AssertionUtil.AssertCollections(expected, actual, AssertionUtil.AssertEqual);
        }

        [Fact]
        public async Task GetConnections_RequiresFromOrTo()
        {
            Guid party = Guid.NewGuid();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/connections?party={party}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetConnections_WhenClientReturnsError_ProvidesStatusFromException()
        {
            Guid party = Guid.NewGuid();
            Guid from = Guid.NewGuid();
            Guid to = Guid.NewGuid();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/connections?party={party}&from={from}&to={to}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task RevokeRole_Success_ReturnsNoContent()
        {
            Guid from = new("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = new("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            Guid roleId = Guid.NewGuid();

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/role/connections?party={from}&from={from}&to={to}&roleId={roleId}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task RevokeRole_RequiresPartyToMatchFromOrTo()
        {
            Guid from = Guid.NewGuid();
            Guid to = Guid.NewGuid();
            Guid party = Guid.NewGuid();
            Guid roleId = Guid.NewGuid();

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/role/connections?party={party}&from={from}&to={to}&roleId={roleId}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task RevokeRole_FeatureToggleOff_ReturnsNotFound()
        {
            Guid from = Guid.NewGuid();
            Guid roleId = Guid.NewGuid();

            HttpResponseMessage response = await _clientFeatureOff.DeleteAsync($"accessmanagement/api/v1/role/connections?party={from}&from={from}&roleId={roleId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task RevokeRole_WhenClientReturnsNotFound_PropagatesStatus()
        {
            Guid from = new("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid to = new("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            Guid missingRoleId = new("00000000-0000-0000-0000-000000000001");

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/role/connections?party={from}&from={from}&to={to}&roleId={missingRoleId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
