using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Altinn.Platform.Profile.Enums;
using Altinn.Platform.Profile.Models;
using Microsoft.AspNetCore.Http;
using Moq;
using User = Altinn.AccessManagement.UI.Core.Models.User.User;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="UserController"/>
    /// </summary>
    [Collection("ProfileController Tests")]
    public class UserControllerTest : IClassFixture<CustomWebApplicationFactory<UserController>>
    {
        private readonly CustomWebApplicationFactory<UserController> _factory;
        private readonly HttpClient _client;
        private readonly HttpClient _client_feature_off;

        private readonly IProfileClient _profileClient;
        private string _testDataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public UserControllerTest(CustomWebApplicationFactory<UserController> factory)
        {
            _factory = factory;
            _profileClient = Mock.Of<IProfileClient>();
            _client = SetupUtils.GetTestClient(factory, null);
            _client_feature_off = SetupUtils.GetTestClient(factory, new FeatureFlags { DisplayLimitedPreviewLaunch = false });
            _testDataFolder = Path.GetDirectoryName(new Uri(typeof(UserControllerTest).Assembly.Location).LocalPath);

        }

        private static UserProfileFE GetUserProfile(int id)
        {
            return new UserProfileFE
            {
                UserId = id,
                Email = "email@domain.com",
                ExternalIdentity = "SomeId",
                PartyId = 1234,
                PhoneNumber = "12345678",
                UserName = "UserName",
                UserType = UserType.None,
                Party = new PartyFE(),
                ProfileSettingPreference = new ProfileSettingPreference
                {
                    DoNotPromptForParty = false,
                    Language = "Norwegian",
                    LanguageType = "NB",
                    PreSelectedPartyId = 1
                }
            };
        }

        /// <summary>
        /// Assert that OK and user is returned upon user found
        /// </summary>
        [Fact]
        public async Task GetUser_UserFound_ReturnsUserProfile()
        {
            const int userId = 20004938;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("accessmanagement/api/v1/user/profile");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var userProfile = await response.Content.ReadFromJsonAsync<UserProfileFE>();
            Assert.Equal(userId, userProfile.UserId);
        }

        /// <summary>
        /// Assert that BadRequest is returned when userId is 0
        /// </summary>
        [Fact]
        public async Task GetUser_UserIdNotSet_ReturnsBadRequest()
        {
            const int userId = 0;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("accessmanagement/api/v1/user/profile");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Assert that NotFound is returned upon user not found by Profile service
        /// </summary>
        [Fact]
        public async Task GetUser_UserNotFoundByProfileService_ReturnsNotFound()
        {
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("accessmanagement/api/v1/user/profile");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Assert that Party is returned if exists
        /// </summary>
        [Fact]
        public async Task GetPartyFromReporteeList_PartyExists()
        {
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string reporteePartyID = "51329012";

            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "ReporteeList", "GetPartyFromReporteeList", $"{reporteePartyID}.json");
            AuthorizedParty expectedResponse = Util.GetMockData<AuthorizedParty>(path);


            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reportee/{reporteePartyID}");
            AuthorizedParty actualResponse = await response.Content.ReadFromJsonAsync<AuthorizedParty>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Assert that 404 Not Found is returned if not found
        /// </summary>
        [Fact]
        public async Task GetPartyFromReporteeList_PartyNotFound()
        {
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string reporteePartyID = "51320000";

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reportee/{reporteePartyID}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        ///  Test case: Get reportee list
        ///  Expected: Returns a list of reportees
        /// </summary>
        [Fact]
        public async Task GetReporteeList_ReturnsList()
        {
            // Arrange
            string partyId = "cd35779b-b174-4ecc-bbef-ece13611be7f";
            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "ReporteeList", $"{partyId}.json");
            const int userId = 1234;
            List<User> expectedResponse = Util.GetMockData<List<User>>(path);
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reporteelist/{partyId}");
            List<User> actualResponse = await response.Content.ReadFromJsonAsync<List<User>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///  Test case: Get reportee list
        ///  Expected: Returns Bad Request if model state is invalid
        /// </summary>
        [Fact]
        public async Task GetReporteeList_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            string invalidPartyId = "1234";
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reporteelist/{invalidPartyId}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        ///   Test case: GetReporteeListForUser returns a list of reportees for the user
        ///   Expected: Returns a list of reportees
        /// </summary>
        [Fact]
        public async Task GetReporteeListForUser_ReturnsList()
        {
            // Arrange
            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "ReporteeList", "GetReporteeListForUser", "reporteeList.json");
            List<AuthorizedParty> expectedResponse = Util.GetMockData<List<AuthorizedParty>>(path);
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist/old");
            List<AuthorizedParty> actualResponse = await response.Content.ReadFromJsonAsync<List<AuthorizedParty>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///   Test case: GetReporteeListForUser returns 400 Bad Request when user id is 0
        ///   Expected: Returns 400 Bad Request
        /// </summary>
        [Fact]
        public async Task GetReporteeListForUser_Returns_400()
        {
            // Arrange
            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "ReporteeList", "GetReporteeListForUser", "reporteeList.json");

            const int userId = 404;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist/old");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        ///   Test case: GetReporteeListForUser returns 500 Internal server error when error occurs
        ///   Expected: Returns 400 Bad Request
        /// </summary>
        [Fact]
        public async Task GetReporteeListForUser_Returns_500()
        {
            // Arrange
            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "ReporteeList", "GetReporteeListForUser", "reporteeList.json");

            const int userId = 500;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist/old");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActorListForAuthenticatedUser returns a list of connections for valid user
        /// Expected: Returns OK with list of connections
        /// </summary>
        [Fact]
        public async Task GetActorListForAuthenticatedUser_ValidUser_ReturnsConnections()
        {
            // Arrange
            const int userId = 20004938;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "RightHolders", "cd35779b-b174-4ecc-bbef-ece13611be7f.json");
            List<Connection> expectedResponse = Util.GetMockData<List<Connection>>(path);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist");
            List<Connection> actualResponse = await response.Content.ReadFromJsonAsync<List<Connection>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        /// Test case: GetActorListForAuthenticatedUser returns empty list when no connections exist
        /// Expected: Returns OK with empty list
        /// </summary>
        [Fact]
        public async Task GetActorListForAuthenticatedUser_NoConnections_ReturnsEmptyList()
        {
            // Arrange
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist");
            List<Connection> actualResponse = await response.Content.ReadFromJsonAsync<List<Connection>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Empty(actualResponse);
        }

        /// <summary>
        /// Test case: GetActorListForAuthenticatedUser returns 404 when service returns null
        /// Expected: Returns 404 Not Found
        /// </summary>
        [Fact]
        public async Task GetActorListForAuthenticatedUser_ServiceReturnsNull_Returns404()
        {
            // Arrange
            const int userId = 404;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActorListForAuthenticatedUser returns 500 when internal server error occurs
        /// Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetActorListForAuthenticatedUser_InternalServerError_Returns500()
        {
            // Arrange
            const int userId = 500;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetFavoriteActorUuids returns list of favorite actor UUIDs for valid user
        /// Expected: Returns OK with list of favorite UUIDs
        /// </summary>
        [Fact]
        public async Task GetFavoriteActorUuids_ValidUser_ReturnsFavoriteUuids()
        {
            // Arrange
            const int userId = 20004938;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            List<string> expectedResponse = new List<string> {
                "cd35779b-b174-4ecc-bbef-ece13611be7f", "167536b5-f8ed-4c5a-8f48-0279507e53ae" };

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist/favorites");
            List<string> actualResponse = await response.Content.ReadFromJsonAsync<List<string>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, Assert.Equal);
        }

        /// <summary>
        /// Test case: GetFavoriteActorUuids returns empty list when user has no favorites
        /// Expected: Returns OK with empty list
        /// </summary>
        [Fact]
        public async Task GetFavoriteActorUuids_NoFavorites_ReturnsEmptyList()
        {
            // Arrange
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            List<string> expectedResponse = new List<string>();

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist/favorites");
            List<string> actualResponse = await response.Content.ReadFromJsonAsync<List<string>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Empty(actualResponse);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, Assert.Equal);
        }

        /// <summary>
        /// Test case: GetFavoriteActorUuids returns 404 when service returns null
        /// Expected: Returns 404 Not Found
        /// </summary>
        [Fact]
        public async Task GetFavoriteActorUuids_ServiceReturnsNull_Returns404()
        {
            // Arrange
            const int userId = 404;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist/favorites");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetFavoriteActorUuids returns 500 when internal server error occurs
        /// Expected: Returns 500 Internal Server Error
        /// </summary>
        [Fact]
        public async Task GetFavoriteActorUuids_InternalServerError_Returns500()
        {
            // Arrange
            const int userId = 500;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist/favorites");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }




        /// <summary>
        /// Test case: CheckAccess returns true when user has admin permissions
        /// Expected: Returns true
        /// </summary>
        [Fact]
        public async Task CheckAccess_WithAdminPermission_ReturnsTrue()
        {
            // Arrange
            const int adminUserId = 20004938;
            var token = PrincipalUtil.GetToken(adminUserId, 1234, 2);

            var partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/isAdmin?party={partyId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            bool hasAccess = await response.Content.ReadFromJsonAsync<bool>();
            Assert.True(hasAccess);
        }

        /// <summary>
        /// Test case: CheckAccess returns false when user doesn't have admin permissions for the provided party
        /// Expected: Returns false
        /// </summary>
        [Fact]
        public async Task CheckAccess_WithoutAdminPermission_ReturnsFalse()
        {
            // Arrange
            const int regularUserId = 1234;
            var token = PrincipalUtil.GetToken(regularUserId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var partyId = Guid.Parse("60fb3d5b-99c2-4df0-aa77-f3fca3bc5199");

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/isAdmin?party={partyId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            bool hasAccess = await response.Content.ReadFromJsonAsync<bool>();
            Assert.False(hasAccess);
        }

        /// <summary>
        /// Test case: CheckAccess returns Forbidden when partyId is null or invalid
        /// Expected: Returns false
        /// </summary>
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("not-a-guid")]
        public async Task CheckAccess_InvalidInputs_ReturnsBadRequest(string invalid_party)
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/isAdmin?party={invalid_party}");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        /// <summary>
        /// Test case: CheckIsClientAdmin returns true when user has client admin permissions
        /// Expected: Returns true
        /// </summary>
        [Fact]
        public async Task CheckIsClientAdmin_WithAdminPermission_ReturnsTrue()
        {
            // Arrange
            const int adminUserId = 20004938;
            var token = PrincipalUtil.GetToken(adminUserId, 1234, 2);

            var partyId = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/isClientAdmin?party={partyId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            bool hasAccess = await response.Content.ReadFromJsonAsync<bool>();
            Assert.True(hasAccess);
        }

        /// <summary>
        /// Test case: CheckIsClientAdmin returns false when user doesn't have client admin permissions for the provided party
        /// Expected: Returns false
        /// </summary>
        [Fact]
        public async Task CheckIsClientAdmin_WithoutAdminPermission_ReturnsFalse()
        {
            // Arrange
            const int regularUserId = 1234;
            var token = PrincipalUtil.GetToken(regularUserId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var partyId = Guid.Parse("60fb3d5b-99c2-4df0-aa77-f3fca3bc5199");

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/isClientAdmin?party={partyId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            bool hasAccess = await response.Content.ReadFromJsonAsync<bool>();
            Assert.False(hasAccess);
        }

        /// <summary>
        /// Test case: CheckIsClientAdmin returns Forbidden when partyId is null or invalid
        /// Expected: Returns false
        /// </summary>
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("not-a-guid")]
        public async Task CheckIsClientAdmin_InvalidInputs_ReturnsForbidden(string invalid_party)
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/isClientAdmin?party={invalid_party}");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }
}