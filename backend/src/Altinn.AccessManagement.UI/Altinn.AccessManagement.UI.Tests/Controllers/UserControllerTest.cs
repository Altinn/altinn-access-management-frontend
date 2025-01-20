using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
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
using static Microsoft.ApplicationInsights.MetricDimensionNames.TelemetryContext;

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
            _client = SetupUtils.GetTestClient(factory);
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

            string path = Path.Combine(_testDataFolder, "Data", "ExpectedResults", "ReporteeList", $"{reporteePartyID}.json");
            AuthorizedParty expectedResponse = Util.GetMockData<AuthorizedParty>(path);


            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reporteelist/{reporteePartyID}");
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

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reporteelist/{reporteePartyID}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
            List<RightHolder> expectedResponse = Util.GetMockData<List<RightHolder>>(path);

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reportee/{reporteePartyID}/rightholders");
            List<RightHolder> actualResponse = await response.Content.ReadFromJsonAsync<List<RightHolder>>();

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
            RightHolderAccesses expectedResponse = Util.GetMockData<RightHolderAccesses>(path);

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reportee/{reporteeUuid}/rightholders/{rightHolderUuid}/accesses");
            RightHolderAccesses actualResponse = await response.Content.ReadFromJsonAsync<RightHolderAccesses>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertEqual(expectedResponse, actualResponse);
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

            var response = await _client.GetAsync($"accessmanagement/api/v1/user/reportee/{reporteeUuid}/rightholders/{rightHolderUuid}/accesses");

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
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);

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
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);

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
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);

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
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);
            httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);
            httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);
            httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);

            // Assert
            Assert.Equal(HttpStatusCode.TooManyRequests, httpResponse.StatusCode);
        }

        /// <summary>
        ///    Test case: Sending the wrong input in body triggers a babd request
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
            HttpResponseMessage httpResponse = await _client.PostAsync($"accessmanagement/api/v1/user/reportee/{partyId}/rightholder/person", content);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
        }
    }
}