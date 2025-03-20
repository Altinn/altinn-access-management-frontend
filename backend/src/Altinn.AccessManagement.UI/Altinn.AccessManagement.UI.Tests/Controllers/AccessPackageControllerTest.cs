using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    ///     Tests for AccessManagmet Resource metadata
    /// </summary>
    [Collection("AccessPackageController Tests")]
    public class AccessPackageControllerTest : IClassFixture<CustomWebApplicationFactory<AccessPackageController>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<AccessPackageController> _factory;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public AccessPackageControllerTest(CustomWebApplicationFactory<AccessPackageController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: Search with empty input
        ///     Expected: Search returns all access packages
        /// </summary>
        [Fact]
        public async Task GetSearch_EmptySearch()
        {
            // Arrange
            List<AccessAreaFE> expectedResult = Util.GetMockData<List<AccessAreaFE>>(_expectedDataPath + "/AccessPackage/Search/emptySearch.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/accesspackage/search");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<AccessAreaFE> actualResources = JsonSerializer.Deserialize<List<AccessAreaFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Search with a set search string
        ///     Expected: Search returns all access packages matching search
        /// </summary>
        [Fact]
        public async Task GetSearch_withSearchString()
        {
            // Arrange
            string searchString = "skattegrunnlag"; // Will return only one package
            List<AccessAreaFE> expectedResult = Util.GetMockData<List<AccessAreaFE>>(_expectedDataPath + "/AccessPackage/Search/searchString_skattegrunnlag.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/search?&searchString={searchString}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<AccessAreaFE> actualResources = JsonSerializer.Deserialize<List<AccessAreaFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Get all access packages for a valid right holder on behalf of a valid party 
        ///     Expected: Returns the right holders active access package delegations, sorted into the areas they belong to
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_ReturnsAccessPackages()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "167536b5-f8ed-4c5a-8f48-0279507e53ae"; // Valid user that has access package rights for the reportee
            Dictionary<string, List<AccessPackageDelegation>> expectedResult = Util.GetMockData<Dictionary<string, List<AccessPackageDelegation>>>(_expectedDataPath + $"/AccessPackage/GetDelegations/{rightHolderUuid}.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Dictionary<string, List<AccessPackageDelegation>> actualResult = JsonSerializer.Deserialize<Dictionary<string, List<AccessPackageDelegation>>>(await response.Content.ReadAsStringAsync(), options);
            
            AssertionUtil.AssertCollections(expectedResult.Keys, actualResult.Keys, Assert.Equal);
            foreach (string key in actualResult.Keys)
            {
                AssertionUtil.AssertCollections(expectedResult[key], actualResult[key], AssertionUtil.AssertEqual);
            }
        }

        /// <summary>
        ///     Test case: The right owned is valid but has no access packages for the reportee party
        ///     Expected: Returns an empty Dictionary
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_RightHolderHasNoAccessPackages()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864837ff9"; // Valid right holder that has no access package rights for the reportee

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Dictionary<string, List<AccessPackageDelegation>> actualResult = JsonSerializer.Deserialize<Dictionary<string, List<AccessPackageDelegation>>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Empty(actualResult.Keys);
        }

        /// <summary>
        ///     Test case: Backend returns a non-successfull status code
        ///     Expected: Returns a non-successfull status
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_BackendHttpError()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864800000"; // This right holder has no relationship to the party

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.False(response.IsSuccessStatusCode);

        }

        /// <summary>
        ///     Test case: Unexpected exception thrown in the BFF
        ///     Expected: Returns a 500 error
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_UnexpectedException()
        {
            // Arrange
            string reporteeUuid = "********"; // Input that will trigger that a mocked unexpected exception is thrown
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864837ff9"; // Valid right holder that has no access package rights for the reportee

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.False(response.IsSuccessStatusCode);
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

        }

        /// <summary>
        ///    Test case: RevokeAccessPackageAccess revokes the access package of a user
        ///    Expected: RevokeAccessPackageAccess returns ok on valid input
        /// </summary>
        [Fact]
        public async Task RevokeAccessPackageAccess_returns_ok_on_valid_input()
        {
            // Arrange
            string from = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string to = "5c0656db-cf51-43a4-bd64-6a91c8caacfb";
            string packageId = "annleggadmin";

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/accesspackage/{from}/{to}/{packageId}/revoke");

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///  Test case: Call RevokeAccessPackageAccess with non-existent package
        ///  Expected: RevokeAccessPackageAccess returns unsuccessfull status code when revoke request fails
        /// </summary>
        [Fact]
        public async Task RevokeAccessPackageAccess_handles_error()
        {
            // Arrange
            string from = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string to = "5c0656db-cf51-43a4-bd64-6a91c8caacfb";
            string packageId = "invalid_package_id";

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync($"accessmanagement/api/v1/accesspackage/{from}/{to}/{packageId}/revoke");

            // Assert
            Assert.False(httpResponse.IsSuccessStatusCode);
        }

        /// <summary>
        ///    Test case: Create a new access package delegation
        ///    Expected: Returns a 201 Created
        /// </summary>
        [Fact]
        public async Task CreateAccessPackageDelegation_ValidRequest_ReturnsCreated()
        {
            // Arrange
            var party = "51329012";
            var packageId = "test_package_id";
            var to = "167536b5-f8ed-4c5a-8f48-0279507e53ae";

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/accesspackage/delegate/{party}/{packageId}/{to}", null);

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        /// <summary>
        ///    Test case: Create a new access package delegation with invalid input
        ///    Expected: Returns a 500 internal server error
        /// </summary>
        [Fact]
        public async Task CreateAccessPackageDelegation_UnexpectedException()
        {
            // Arrange
            var party = "********";
            var packageId = "test_package_id";
            var to = "167536b5-f8ed-4c5a-8f48-0279507e53ae";

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/accesspackage/delegate/{party}/{packageId}/{to}", null);

            // Assert
            Assert.False(response.IsSuccessStatusCode);
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///    Test case: Create a new access package delegation that throws exception in backend
        ///    Expected: Returns a not successfull status code
        /// </summary>
        [Fact]
        public async Task CreateAccessPackageDelegation_BadRequest()
        {
            // Arrange

            var party = "51329012";
            var packageId = "";
            var to = "167536b5-f8ed-4c5a-8f48-0279507e53ae";

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/accesspackage/delegate/{party}/{packageId}/{to}", null);

            // Assert
            Assert.False(response.IsSuccessStatusCode);
        }

        /// <summary>
        ///    Test case: Checks if the user can delegate a a list of Roles
        ///    Expected: Returns a list of AccessPackageDelegationCheckResponse
        ///    with the result of the delegation check
        /// </summary>
        [Fact]
        public async Task PackageDelegationCheck_handles_list()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            var packageIds = new List<string>
            {
                "0bb5963e-df17-4f35-b913-3ce10a34b866",
                "04c5a001-5249-4765-ae8e-58617c404223",
                "5eb07bdc-5c3c-4c85-add3-5405b214b8a3",
                "9d2ec6e9-5148-4f47-9ae4-4536f6c9c1cb",
                "78c21107-7d2d-4e85-af82-47ea0e47ceca",
                "906aec0d-ad1f-496b-a0bb-40f81b3303cb",
                "a03af7d5-74b9-4f18-aead-5d47edc36be5",
                "cfe074fa-0a66-4a4b-974a-5d1db8eb94e6",
                "f7e02568-90b6-477d-8abb-44984ddeb1f9"
            };
            List<AccessPackageDelegationCheckResponse> expectedResult = Util.GetMockData<List<AccessPackageDelegationCheckResponse>>(_expectedDataPath + "/AccessPackage/PackageDelegationCheck_returns_list.json");


            // Act
            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/accesspackage/delegationcheck", 
                new StringContent(
                        JsonSerializer.Serialize(new { packageIds, reporteeUuid }), 
                        System.Text.Encoding.UTF8, "application/json"
                    )
                );
            
            var content = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(response.Content);

            List<AccessPackageDelegationCheckResponse> actual = JsonSerializer.Deserialize<List<AccessPackageDelegationCheckResponse>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(actual, expectedResult, AssertionUtil.AssertEqual);  
        }

        /// <summary>
        ///    Test case: Handles empty list of packageIds
        ///    Expected: Returns a bad request status code
        /// </summary>
        [Fact]
        public async Task PackageDelegationCheck_BadRequest()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            var packageIds = new List<string>();
            
            // Act
            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/accesspackage/delegationcheck", 
                new StringContent(
                        JsonSerializer.Serialize(new { packageIds, reporteeUuid }), 
                        System.Text.Encoding.UTF8, "application/json"
                    )
                );
            
            var content = await response.Content.ReadAsStringAsync();

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

         /// <summary>
        ///    Test case: Handles unexpected error
        ///    Expected: Returns internal server error
        /// </summary>
        [Fact]
        public async Task PackageDelegationCheck_UnexpectedError()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            var packageIds = new List<string>
            {
                "fa84bffc-ac17-40cd-af9c-61c89f92e44c"  // valid package id that will trigger an unexpected exception in mock client
            };
            
            // Act
            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/accesspackage/delegationcheck", 
                new StringContent(
                        JsonSerializer.Serialize(new { packageIds, reporteeUuid }), 
                        System.Text.Encoding.UTF8, "application/json"
                    )
                );
            

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }
    }   
}
