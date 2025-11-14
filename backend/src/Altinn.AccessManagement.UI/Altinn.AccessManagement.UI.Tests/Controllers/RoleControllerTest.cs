using System.Collections.Generic;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

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
        private readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private const string ExpectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public RoleControllerTest(CustomWebApplicationFactory<RoleController> factory)
        {
            _client = SetupUtils.GetTestClient(factory, new FeatureFlags());
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
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
            Assert.Equivalent(expected, actual);
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
        public async Task GetRoleById_ReturnsExpectedRole()
        {
            Guid roleId = new("55bd7d4d-08dd-46ee-ac8e-3a44d800d752");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/{roleId}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            RoleMetadata actual = JsonSerializer.Deserialize<RoleMetadata>(await response.Content.ReadAsStringAsync(), _serializerOptions);
            RoleMetadata expected = Util.GetMockData<RoleMetadata>($"{ExpectedDataPath}/Role/Details/{roleId}.json");

            AssertionUtil.AssertEqual(expected, actual);
        }

        [Fact]
        public async Task GetRoleById_WhenNotFound_ReturnsNotFound()
        {
            Guid missingRoleId = Guid.NewGuid();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/{missingRoleId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetRolePackages_ReturnsExpectedPackages()
        {
            const string roleCode = "daglig-leder";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/packages?roleCode={roleCode}&variant=person&includeResources=true");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<AccessPackage> actual = JsonSerializer.Deserialize<List<AccessPackage>>(await response.Content.ReadAsStringAsync(), _serializerOptions);
            List<AccessPackage> expected = Util.GetMockData<List<AccessPackage>>($"{ExpectedDataPath}/Role/Packages/{roleCode}.json");

            Assert.NotNull(actual);
            Assert.Equivalent(expected, actual);
        }

        [Fact]
        public async Task GetRoleResources_ReturnsExpectedResources()
        {
            const string roleCode = "daglig-leder";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/resources?roleCode={roleCode}&variant=person&includePackageResources=true");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ResourceAM> actual = JsonSerializer.Deserialize<List<ResourceAM>>(await response.Content.ReadAsStringAsync(), _serializerOptions);
            List<ResourceAM> expected = Util.GetMockData<List<ResourceAM>>($"{ExpectedDataPath}/Role/Resources/{roleCode}.json");

            Assert.NotNull(actual);
            Assert.Equivalent(expected, actual);
        }
    }
}
