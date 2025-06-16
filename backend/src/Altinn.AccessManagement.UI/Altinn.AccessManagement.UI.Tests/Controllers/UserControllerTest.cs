using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.User;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Models;
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
        /// Assert that List of right holders is returned when valid input
        /// </summary>
        [Fact]
        public async Task GetReporteeRightHolders_ReturnsList()
        {
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string reporteePartyID = "51329012";

            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "RightHolders", $"{reporteePartyID}.json");
            List<User> expectedResponse = Util.GetMockData<List<User>>(path);

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reportee/{reporteePartyID}/rightholders");
            List<User> actualResponse = await response.Content.ReadFromJsonAsync<List<User>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
        }

        /// <summary>
        /// Right holder's list of accesses is returned when valid input
        /// </summary>
        [Fact]
        public async Task GetRightholderAccesses_Returns_Accesses()
        {
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "5c0656db-cf51-43a4-bd64-6a91c8caacfb"; // Valid user that has rights for the reportee

            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "RightHolders", "RightHolderAccess", $"{rightHolderUuid}.json");
            UserAccesses expectedResponse = Util.GetMockData<UserAccesses>(path);

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/from/{reporteeUuid}/to/{rightHolderUuid}/accesses");
            UserAccesses actualResponse = await response.Content.ReadFromJsonAsync<UserAccesses>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Returns Bad Request when invalid input
        /// </summary>
        [Fact]
        public async Task GetRightholderAccesses_Invalid_ModelState()
        {
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "invalid_guid"; // invalid user uuid

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/from/{reporteeUuid}/to/{rightHolderUuid}/accesses");
            UserAccesses actualResponse = await response.Content.ReadFromJsonAsync<UserAccesses>();

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Invalid rightHolderUuid returns HTTP error when invalid input is provided
        /// </summary>
        [Fact]
        public async Task GetRightholderAccesses_Invalid_Input()
        {
            const int userId = 1234;
            var token = PrincipalUtil.GetToken(userId, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "5c0656db-cf51-43a4-bd64-6a91c800000"; // Invalid user uuid. User has no rights for reportee

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/from/{reporteeUuid}/to/{rightHolderUuid}/accesses");

            Assert.False(response.IsSuccessStatusCode);
        }

        /// <summary>
        ///    Test case: Validate a valid person
        ///    Expected: Returns a 200 and the party uuid of the person
        /// </summary>
        [Fact]
        public async Task ValidatePerson_ValidInput()
        {
            // Arrange
            var partyId = 51329012;
            var ssn = "20838198385";
            var lastname = "Medaljong";

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            ValidatePersonInput input = new ValidatePersonInput { Ssn = ssn, LastName = lastname };
            string jsonRights = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonRights, Encoding.UTF8, "application/json");

            var expectedResponse = Guid.Parse("167536b5-f8ed-4c5a-8f48-0279507e53ae");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);

            var response = await httpResponse.Content.ReadFromJsonAsync<Guid>();
            Assert.Equal(expectedResponse, response);

        }

        /// <summary>
        ///    Test case: Enter invalid input
        ///    Expected: Returns a 404 not found
        /// </summary>
        [Fact]
        public async Task ValidatePerson_InvalidInput()
        {
            // Arrange
            var partyId = 51329012;
            var ssn = "2083819838a"; // Invalid ssn
            var lastname = "Medaljong";

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            ValidatePersonInput input = new ValidatePersonInput { Ssn = ssn, LastName = lastname };
            string jsonRights = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonRights, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: Enter an ivalid ssn and last name combination
        ///    Expected: Returns a 404 not found
        /// </summary>
        [Fact]
        public async Task ValidatePerson_InvalidInputCombination()
        {
            // Arrange
            var partyId = 51329012;
            var ssn = "20838198385"; // Valid ssn
            var lastname = "Albatross"; // Valid last name, but does not belong to person with given ssn

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            ValidatePersonInput input = new ValidatePersonInput { Ssn = ssn, LastName = lastname };
            string jsonRights = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonRights, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: Enter invalid data too many times
        ///    Expected: Returns a 429 - too many requests
        /// </summary>
        [Fact]
        public async Task ValidatePerson_TooManyRequests()
        {
            // Arrange
            var partyId = 51329012;
            var ssn = "20838198311"; // Invalid ssn
            var lastname = "Hansen"; // Invalid name combination

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            ValidatePersonInput input = new ValidatePersonInput { Ssn = ssn, LastName = lastname };
            string jsonRights = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonRights, Encoding.UTF8, "application/json");

            // Act - reapeat the request 4 times to lock the user
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);
            httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);
            httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);
            httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);

            // Assert
            Assert.Equal(HttpStatusCode.TooManyRequests, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: Sending the wrong input in body triggers a bad request
        ///    Expected: Returns a 400 - bad request
        /// </summary>
        [Fact]
        public async Task ValidatePerson_BadRequest()
        {
            // Arrange
            var partyId = 51329012;
            string input = "The wrong input";

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            string jsonRights = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonRights, Encoding.UTF8, "application/json");

            // Act 
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: ValidatePerson when feature is toggled off
        ///    Expected: Returns a 404 - not found
        /// </summary>
        [Fact]
        public async Task ValidatePerson_Feature_Toggle_Off()
        {
            // Arrange
            var partyId = 51329012;
            var ssn = "20838198385"; // valid input
            var lastname = "Medaljong";

            HttpClient client = _client_feature_off;

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            ValidatePersonInput input = new ValidatePersonInput { Ssn = ssn, LastName = lastname };
            string jsonRights = JsonSerializer.Serialize(input);
            HttpContent content = new StringContent(jsonRights, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage httpResponse = await client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/validateperson", content);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: AddReporteeRightHolder succeeds with valid inputs
        ///    Expected: Returns 200 OK
        /// </summary>
        [Fact]
        public async Task AddReporteeRightHolder_ValidInput_ReturnsOk()
        {
            // Arrange
            var reporteePartyUuid = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f"); // Valid reportee
            var rightHolderPartyUuid = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb"); // Valid right holder

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync(
                $"accessmanagement/api/v1/user/reportee/{reporteePartyUuid}/rightholder?rightholderPartyUuid={rightHolderPartyUuid}",
                null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: AddReporteeRightHolder with invalid model state
        ///    Expected: Returns 400 Bad Request
        /// </summary>
        [Fact]
        public async Task AddReporteeRightHolder_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var reporteePartyUuid = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f"); // Valid reportee
            var invalidRightHolderUuid = "not-a-guid"; // Invalid UUID format

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync(
                $"accessmanagement/api/v1/user/reportee/{reporteePartyUuid}/rightholder?rightholderPartyUuid={invalidRightHolderUuid}",
                null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: AddReporteeRightHolder that triggers an HttpStatusException
        ///    Expected: Returns status code based on the exception
        /// </summary>
        [Fact]
        public async Task AddReporteeRightHolder_TriggersHttpStatusException_ReturnsErrorStatus()
        {
            // Arrange
            // Using Guid.Empty will trigger the InternalServerError in RightHolderClientMock
            var reporteePartyUuid = Guid.Empty;
            var rightHolderPartyUuid = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage httpResponse = await _client.PostAsync(
                $"accessmanagement/api/v1/user/reportee/{reporteePartyUuid}/rightholder?rightholderPartyUuid={rightHolderPartyUuid}",
                null);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, httpResponse.StatusCode);
            string content = await httpResponse.Content.ReadAsStringAsync();
            Assert.Contains("Unexpected HttpStatus response", content);
        }

        /// <summary>
        ///    Test case: RevokeRightHolder succeeds with valid inputs
        ///    Expected: Returns 200 OK
        /// </summary>
        [Fact]
        public async Task RevokeRightHolder_ValidInput_ReturnsNoContent()
        {
            // Arrange
            var reporteePartyUuid = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f"); // Valid reportee
            var rightHolderPartyUuid = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb"); // Valid right holder

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync(
                $"accessmanagement/api/v1/user/reportee/{reporteePartyUuid}/rightholder?rightholderPartyUuid={rightHolderPartyUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: RevokeRightHolder with invalid model state
        ///    Expected: Returns 400 Bad Request
        /// </summary>
        [Fact]
        public async Task RevokeRightHolder_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var reporteePartyUuid = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f"); // Valid reportee
            var invalidRightHolderUuid = "not-a-guid"; // Invalid UUID format

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync(
                $"accessmanagement/api/v1/user/reportee/{reporteePartyUuid}/rightholder?rightholderPartyUuid={invalidRightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: RevokeRightHolder that triggers an HttpStatusException
        ///    Expected: Returns status code based on the exception
        /// </summary>
        [Fact]
        public async Task RevokeRightHolder_TriggersHttpStatusException_ReturnsErrorStatus()
        {
            // Arrange
            // Using Guid.Empty will trigger the HttpStatusException in the mock
            var reporteePartyUuid = Guid.Empty;
            var rightHolderPartyUuid = Guid.Parse("5c0656db-cf51-43a4-bd64-6a91c8caacfb");

            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage httpResponse = await _client.DeleteAsync(
                $"accessmanagement/api/v1/user/reportee/{reporteePartyUuid}/rightholder?rightholderPartyUuid={rightHolderPartyUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
            string content = await httpResponse.Content.ReadAsStringAsync();
            Assert.Contains("Unexpected HttpStatus response", content);
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
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist");
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
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist");

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
            var response = await _client.GetAsync("accessmanagement/api/v1/user/actorlist");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///   Test case: GetRightholders returns bad request when invalid model state
        ///   Expected: Returns 400 Bad Request
        /// </summary>
        [Fact]
        public async Task GetRightholders_BadRequestOnInvalidModelState()
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/rightholders?party=invalid-party-id");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Theory]
        [InlineData("b0a79f3d-4cef-430a-9774-301b754e0f6f", null, null)]
        [InlineData("60fb3d5b-99c2-4df0-aa77-f3fca3bc5199", "", "")]
        public async Task GetRightholders_MissingPartyAndFromOrTo_ReturnsBadRequest(string party, string from, string to)
        {
            /// Arrange
            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/rightholders?party={party}&from={from}&to={to}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal("Either 'from' or 'to' query parameter must be provided.", await response.Content.ReadAsStringAsync());
        }

        [Theory]
        [InlineData(null, "b0a79f3d-4cef-430a-9774-301b754e0f6f", "")]
        [InlineData("", "60fb3d5b-99c2-4df0-aa77-f3fca3bc5199", "")]
        [InlineData("", "b0a79f3d-4cef-430a-9774-301b754e0f6f", "60fb3d5b-99c2-4df0-aa77-f3fca3bc5199")]
        public async Task GetRightholders_MissingPartyAndFromOrTo_ReturnsInvalidModelState(string party, string from, string to)
        {
            /// Arrange
            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/rightholders?party={party}&from={from}&to={to}");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Contains("The value '' is invalid", await response.Content.ReadAsStringAsync());
        }

        [Fact]
        public async Task GetRightholders_HandlesError()
        {
            /// Arrange
            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/rightholders?party={Guid.Empty}&from={Guid.Empty}&to={Guid.Empty}");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }


        [Theory]
        [InlineData("cd35779b-b174-4ecc-bbef-ece13611be7f", "cd35779b-b174-4ecc-bbef-ece13611be7f", "")]
        [InlineData("60fb3d5b-99c2-4df0-aa77-f3fca3bc5199", "", "60fb3d5b-99c2-4df0-aa77-f3fca3bc5199")]
        public async Task GetRightholders_ReturnsRightholdersList(string party, string from, string to)
        {
            /// Arrange
            var token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "RightHolders", $"{party}.json");
            List<User> expectedResponse = Util.GetMockData<List<User>>(path);

            // Act
            var response = await _client.GetAsync($"accessmanagement/api/v1/user/rightholders?party={party}&from={from}&to={to}");
            var resJson = await response.Content.ReadAsStringAsync();
            List<User> actualResponse = await response.Content.ReadFromJsonAsync<List<User>>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertCollections(expectedResponse, actualResponse, AssertionUtil.AssertEqual);
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
    }
}