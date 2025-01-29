using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Test class for RoleController
    /// </summary>
    [Collection("RoleController Tests")]
    public class RoleControllerTest : IClassFixture<CustomWebApplicationFactory<RoleController>>
    {
        private readonly HttpClient _client;
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
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
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

    }
}