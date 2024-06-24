using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Altinn.Common.PEP.Interfaces;
using Altinn.Platform.Profile.Enums;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Models;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Moq;

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

        private static UserProfile GetUserProfile(int id)
        {
            return new UserProfile
            {
                UserId = id,
                Email = "email@domain.com",
                ExternalIdentity = "SomeId",
                PartyId = 1234,
                PhoneNumber = "12345678",
                UserName = "UserName",
                UserType = UserType.None,
                Party = new Party(),
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
            var userProfile = await response.Content.ReadFromJsonAsync<UserProfile>();
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
        public async Task GetUser_UserNotFoundByProfoileService_ReturnsNotFound()
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
    }
}