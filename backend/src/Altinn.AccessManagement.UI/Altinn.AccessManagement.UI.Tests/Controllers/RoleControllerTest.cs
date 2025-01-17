﻿using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Role;
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
            List<RoleAssignment> expectedResult = Util.GetMockData<List<RoleAssignment>> (_expectedDataPath + $"/Role/GetRolesForUser/{rightHolderUuid}.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/assignments/{rightOwnerUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<RoleAssignment> actualResult = JsonSerializer.Deserialize<List<RoleAssignment>>(await response.Content.ReadAsStringAsync(), options);
            
            AssertionUtil.AssertCollections(expectedResult, actualResult, AssertionUtil.AssertEqual);
           
        }


        /// <summary>
        ///     Test case: Get roles for user that doesn't has roles
        ///     Expected: Returns users roles for the given and right holder and right owner
        /// </summary>
        [Fact]
        public async Task GetRolesForUser_HasNoRoles()
        {
            string rightOwnerUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "5c0656db-cf51-43a4-bd64-6a91c8caacfb"; // Valid user that doesn't has role-assignments for the reportee
            List<RoleAssignment> expectedResult = Util.GetMockData<List<RoleAssignment>> (_expectedDataPath + $"/Role/GetRolesForUser/{rightHolderUuid}.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/role/assignments/{rightOwnerUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<RoleAssignment> actualResult = JsonSerializer.Deserialize<List<RoleAssignment>>(await response.Content.ReadAsStringAsync(), options);
            
            AssertionUtil.AssertCollections(expectedResult, actualResult, AssertionUtil.AssertEqual);
           
        }
    }
}