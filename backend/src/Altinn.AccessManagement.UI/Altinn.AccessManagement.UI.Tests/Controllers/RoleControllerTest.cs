using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.Role.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for RoleController
    /// </summary>
    [Collection("RoleController Tests")]
    public class RoleControllerTest : IClassFixture<CustomWebApplicationFactory<RoleController>>
    {
        private readonly HttpClient _client;
        private readonly HttpClient _client_feature_off;
        private readonly CustomWebApplicationFactory<RoleController> _factory;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public RoleControllerTest(CustomWebApplicationFactory<RoleController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory, null);
            _client_feature_off = SetupUtils.GetTestClient(factory, new FeatureFlags { DisplayRoles = false });

            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            _client_feature_off.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client_feature_off.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: Get a role by using a valid id
        ///     Expected: Returns the expected role
        /// </summary>
        [Fact]
        public async Task GetRolebyId_ValidId()
        {
            Guid roleId = new Guid("55bd7d4d-08dd-46ee-ac8e-3a44d800d752"); // daglig leder
            Core.Models.Common.Role expectedResult = Util.GetMockData<List<Core.Models.Common.Role>>(_expectedDataPath + $"/Role/roles.json").FirstOrDefault(r => r.Id == roleId);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/{roleId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Core.Models.Common.Role actualResult = JsonSerializer.Deserialize<Core.Models.Common.Role>(await response.Content.ReadAsStringAsync(), options);

            AssertionUtil.AssertEqual(expectedResult, actualResult);
        }

        /// <summary>
        ///     Test case: Get role metadata with invalid model state
        ///     Expected: Returns BadRequest
        /// </summary>
        [Fact]
        public async Task GetRoleMetaById_InvalidModelState()
        {
            // Arrange - using an invalid GUID format to trigger model state validation
            string invalidId = "invalid-guid-format";

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/{invalidId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Get role metadata by id that doesn't exist
        ///     Expected: Returns NoContent when role is not found
        /// </summary>
        [Fact]
        public async Task GetRoleMetaById_NotFound()
        {
            // Arrange - using a GUID that doesn't exist in the mock data
            Guid nonExistentRoleId = new Guid("00000000-0000-0000-0000-000000000001");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/{nonExistentRoleId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Get role metadata with id that triggers internal server error
        ///     Expected: Returns InternalServerError
        /// </summary>
        [Fact]
        public async Task GetRoleMetaById_InternalServerError()
        {
            // Arrange - using the specific GUID that triggers internal server error in the mock
            Guid errorTriggeringId = new Guid("d98ac728-d127-4a4c-96e1-738f856e5332");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/{errorTriggeringId}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///     Test case: Get roles for user that has roles
        ///     Expected: Returns users roles for the given and right holder and right owner
        /// </summary>
        [Fact]
        public async Task GetRolesForUser_HasRoles()
        {
            string rightOwnerUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "167536b5-f8ed-4c5a-8f48-0279507e53ae"; // Valid user that has role-assignments for the reportee
            List<RoleAssignment> expectedResult = Util.GetMockData<List<RoleAssignment>>(_expectedDataPath + $"/Role/GetRolesForUser/{rightHolderUuid}.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/assignments/{rightOwnerUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<RoleAssignment> actualResult = JsonSerializer.Deserialize<List<RoleAssignment>>(await response.Content.ReadAsStringAsync(), options);

            AssertionUtil.AssertCollections(expectedResult, actualResult, AssertionUtil.AssertEqual);
        }


        /// <summary>
        ///     Test case: Get roles for user that doesn't have roles
        ///     Expected: Returns users roles for the given and right holder and right owner
        /// </summary>
        [Fact]
        public async Task GetRolesForUser_HasNoRoles()
        {
            string rightOwnerUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864837ff9"; // Valid user that doesn't has role-assignments for the reportee
            List<RoleAssignment> expectedResult = Util.GetMockData<List<RoleAssignment>>(_expectedDataPath + $"/Role/GetRolesForUser/{rightHolderUuid}.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/assignments/{rightOwnerUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<RoleAssignment> actualResult = JsonSerializer.Deserialize<List<RoleAssignment>>(await response.Content.ReadAsStringAsync(), options);

            AssertionUtil.AssertCollections(expectedResult, actualResult, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: get roles returns error if error is thrown
        ///     Expected: Returns the error  
        /// </summary>
        [Fact]
        public async Task GetRolesForUser_InternalError()
        {
            string rightOwnerUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "00000000-0000-0000-0000-000000000000"; // invalid uuid that will cause internal error

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/assignments/{rightOwnerUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///     Test case: get roles when feature toggle is off
        ///     Expected: Returns NotFound  
        /// </summary>
        [Fact]
        public async Task GetRolesForUser_Feature_Toggle_Off()
        {
            string rightOwnerUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864837ff9"; // invalid uuid that will cause internal error

            // Act
            HttpResponseMessage response = await _client_feature_off.GetAsync($"accessmanagement/api/v1/role/assignments/{rightOwnerUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        ///    Test case: Delegate role
        ///    Expected: Returns OK
        /// </summary>
        [Fact]
        public async Task DelegateRole_ValidRequest()
        {
            // Arrange
            Guid from = Guid.NewGuid();
            Guid to = Guid.NewGuid();
            Guid roleId = Guid.NewGuid();

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/role/delegate/{from}/{to}/{roleId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        /// <summary>
        ///   Test case: Delegate role with invalid request
        ///   Expected: Returns internal server error
        /// </summary>
        [Fact]
        public async Task DelegateRole_InvalidRequest()
        {
            // Arrange
            Guid from = Guid.Empty;
            Guid to = Guid.Empty;
            Guid roleId = Guid.Empty;

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/role/delegate/{from}/{to}/{roleId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///    Test case: Delegate role when feature toggle is off
        ///    Expected: Returns NotFound
        /// </summary>
        [Fact]
        public async Task DelegateRole_Feature_Toggle_Off()
        {
            // Arrange
            Guid from = Guid.NewGuid();
            Guid to = Guid.NewGuid();
            Guid roleId = Guid.NewGuid();

            // Act
            HttpResponseMessage response = await _client_feature_off.PostAsync($"accessmanagement/api/v1/role/delegate/{from}/{to}/{roleId}", null);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        ///   Test case: Revoke role
        ///   Expected: Returns OK
        /// </summary>
        [Fact]
        public async Task RevokeRole_ValidRequest()
        {
            // Arrange
            Guid assignmentId = Guid.NewGuid();

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/role/assignments/{assignmentId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        }

        /// <summary>
        ///  Test case: Revoke role with invalid request
        ///  Expected: Returns internal server error
        ///  </summary>
        [Fact]
        public async Task RevokeRole_InvalidRequest()
        {
            // Arrange
            Guid assignmentId = Guid.Empty;

            // Act
            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/role/assignments/{assignmentId}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///   Test case: Revoke role when feature toggle is off
        ///   Expected: Returns NotFound
        /// </summary>
        [Fact]
        public async Task RevokeRole_Feature_Toggle_Off()
        {
            // Arrange
            Guid assignmentId = Guid.NewGuid();

            // Act
            HttpResponseMessage response = await _client_feature_off.DeleteAsync($"accessmanagement/api/v1/role/assignments/{assignmentId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        }

        /// <summary>
        ///   Test case: Role delegation check when feature toggle is off
        ///   Expected: Returns NotFound
        /// </summary>
        /// <returns></returns>

        [Fact]
        public async Task RoleDelegationCheck_Disabled_Feature_Toggle()
        {

            // uuid for Intelligent Albatross
            string rightOwnerUuid = "5c0656db-cf51-43a4-bd64-6a91c8caacfb";
            // roleId for Tilgangsstyring
            var roleUuid = "4691c710-e0ad-4152-9783-9d1e787f02d3";

            var res = await _client_feature_off.GetAsync($"accessmanagement/api/v1/role/delegationcheck/{rightOwnerUuid}/{roleUuid}");

            Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
        }

        /// <summary>
        ///     Test case: Search roles with empty input
        ///     Expected: Search returns all roles
        /// </summary>
        [Fact]
        public async Task GetRoleSearch_EmptySearch()
        {
            // Arrange
            List<RoleAreaFE> expectedResult = Util.GetMockData<List<RoleAreaFE>>(_expectedDataPath + "/Role/Search/emptySearch.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/role/search");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<RoleAreaFE> actualResources = JsonSerializer.Deserialize<List<RoleAreaFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Search roles with "hovedadmin" as input
        ///     Expected: Search returns all matching roles
        /// </summary>
        [Fact]
        public async Task GetRoleSearch_Search_HovedAdmin()
        {
            // Arrange
            List<RoleAreaFE> expectedResult = Util.GetMockData<List<RoleAreaFE>>(_expectedDataPath + "/Role/Search/search_hovedadmin.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/role/search?searchString=hovedadmin");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<RoleAreaFE> actualResources = JsonSerializer.Deserialize<List<RoleAreaFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }
    }
}
