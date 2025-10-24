using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Register;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using AltinnCore.Authentication.Constants;
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
    /// Test class for <see cref="LookupController"/>
    /// </summary>
    [Collection("LookupController Tests")]
    public class LookupControllerTest : IClassFixture<CustomWebApplicationFactory<LookupController>>
    {
        private readonly CustomWebApplicationFactory<LookupController> _factory;
        private readonly HttpClient _client;
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IRegisterClient _registerClient;
        private readonly string _testDataPath;

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public LookupControllerTest(CustomWebApplicationFactory<LookupController> factory)
        {
            _factory = factory;
            _accessManagementClient = Mock.Of<IAccessManagementClient>();
            _registerClient = new RegisterClientMock();
            _client = GetTestClient();
            _testDataPath = Path.Combine(GetTestDataPath(), "ExpectedResults", "Lookup");
        }

        private static string GetTestDataPath()
        {
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(LookupControllerTest).Assembly.Location).LocalPath);
            return Path.Combine(unitTestFolder, "Data");
        }

        private HttpClient GetTestClient()
        {
            var httpClient = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton(sp => _accessManagementClient);
                    services.AddSingleton(sp => _registerClient);
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return httpClient;
        }

        /// <summary>
        /// Assert that an authenticated user is able to lookup an organization
        /// </summary>
        [Fact]
        public async Task GetPartyForOrganization_Success()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1337, 501337));
            string lookupOrgNo = "810418672";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/org/{lookupOrgNo}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PartyFE actualParty = await response.Content.ReadFromJsonAsync<PartyFE>();
            Assert.Equal(lookupOrgNo, actualParty.OrgNumber);
            Assert.Equal(50004222, actualParty.PartyId);
            Assert.Equal(PartyType.Organization, actualParty.PartyTypeName);
            Assert.Equal("KARLSTAD OG ULOYBUKT", actualParty.Name);
        }

        /// <summary>
        /// Assert that an un-authenticated user gets 401 response
        /// </summary>
        [Fact]
        public async Task GetPartyForOrganization_Unauthenticated_401()
        {
            string lookupOrgNo = "810418672";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/org/{lookupOrgNo}");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        /// <summary>
        /// Assert that an authenticated user is able to lookup a party based on uuid, using the old Register data
        /// </summary>
        [Fact]
        public async Task GetPartyByUUID_OldRegistry_Success()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1337, 501337));
            Guid lookupUUID = new Guid("60fb3d5b-99c2-4df0-aa77-f3fca3bc5199");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/party/{lookupUUID}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PartyFE actualParty = await response.Content.ReadFromJsonAsync<PartyFE>();
            Assert.Equal(lookupUUID, actualParty.PartyUuid);
            Assert.Equal(51317934, actualParty.PartyId);
            Assert.Equal(PartyType.Organization, actualParty.PartyTypeName);
            Assert.Equal("RAKRYGGET UNG TIGER AS", actualParty.Name);
        }

        /// <summary>
        /// Assert that a request for a non-existant partyUUID yields a 404 response
        /// </summary>
        [Fact]
        public async Task GetPartyByUUID_NotFound()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1337, 501337));
            Guid lookupUUID = new Guid("0b74b132-cd8c-44ba-8818-a8d0cf4401bc"); // non-existent partyUUID

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/party/{lookupUUID}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Assert that an un-authenticated user gets 401 response
        /// </summary>
        [Fact]
        public async Task GetPartyByUUID_Unauthenticated_401()
        {
            Guid lookupUUID = new Guid("0b74b132-cd8c-44ba-8818-a8d0cf4401bc");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/party/{lookupUUID}");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        /// <summary>
        /// Assert that an authenticated user is able to lookup a user based on uuid
        /// </summary>
        [Fact]
        public async Task GetUserByUUID_Success()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1337, 501337));
            Guid lookupUUID = new Guid("cd772c20-f780-43f6-819f-2d9f23fc0a1a");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/user/{lookupUUID}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            UserProfileFE actualUser = await response.Content.ReadFromJsonAsync<UserProfileFE>();
            Assert.Equal(lookupUUID, actualUser.UserUuid);
            Assert.Equal(20004938, actualUser.UserId);
            Assert.Equal(50019992, actualUser.PartyId);
            Assert.Equal(PartyType.Person, actualUser.Party.PartyTypeName);
            Assert.Equal("JARLE GJERSTAD", actualUser.Party.Name);
        }

        /// <summary>
        /// Assert that a request for a non-existant userUUID yields a 404 response
        /// </summary>
        [Fact]
        public async Task GetUserByUUID_NotFound()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1337, 501337));
            Guid lookupUUID = new Guid("0b74b132-cd8c-44ba-8818-a8d0cf4401bc"); // non-existent partyUUID

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/user/{lookupUUID}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Assert that an un-authenticated user gets 401 response
        /// </summary>
        [Fact]
        public async Task GetUserByUUID_Unauthenticated_401()
        {
            Guid lookupUUID = new Guid("cd772c20-f780-43f6-819f-2d9f23fc0a1a");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/user/{lookupUUID}");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        /// <summary>
        /// Assert that an authenticated user can retrieve their party information successfully
        /// </summary>
        [Fact]
        public async Task GetPartyFromLoggedInUser_Success()
        {
            // Arrange
            Guid userPartyUuid = new Guid("167536b5-f8ed-4c5a-8f48-0279507e53ae");
            string token = PrincipalUtil.GetToken(1337, 50789533, userPartyUuid, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            
            string path = Path.Combine(_testDataPath, "GetPartyFromLoggedInUser", "person_party.json");
            PartyFE expectedParty = Util.GetMockData<PartyFE>(path);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/lookup/party/user");
            PartyFE actualParty = await response.Content.ReadFromJsonAsync<PartyFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertEqual(expectedParty, actualParty);
        }

        /// <summary>
        /// Assert that an authenticated user without party UUID in token gets a 400 Bad Request
        /// </summary>
        [Fact]
        public async Task GetPartyFromLoggedInUser_MissingPartyUuidInToken_400()
        {
            // Arrange
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1337, 501337));

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/lookup/party/user");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Assert that an unauthenticated user gets 401 Unauthorized response
        /// </summary>
        [Fact]
        public async Task GetPartyFromLoggedInUser_Unauthenticated_401()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/lookup/party/user");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        /// <summary>
        /// Assert that a request with a non-existent party UUID returns 404 Not Found
        /// </summary>
        [Fact]
        public async Task GetPartyFromLoggedInUser_PartyNotFound_404()
        {
            // Arrange
            Guid nonExistentUuid = new Guid("00000000-0000-0000-0000-000000000001");
            string token = PrincipalUtil.GetToken(1337, 501337, nonExistentUuid, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/lookup/party/user");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Assert that an authenticated user can retrieve organization party information
        /// </summary>
        [Fact]
        public async Task GetPartyFromLoggedInUser_OrganizationParty_Success()
        {
            // Arrange
            Guid orgPartyUuid = new Guid("6b0574ae-f569-4c0d-a8d4-8ad56f427890");
            string token = PrincipalUtil.GetToken(1337, 50067799, orgPartyUuid, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            
            string path = Path.Combine(_testDataPath, "GetPartyFromLoggedInUser", "organization_party.json");
            PartyFE expectedParty = Util.GetMockData<PartyFE>(path);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/lookup/party/user");
            PartyFE actualParty = await response.Content.ReadFromJsonAsync<PartyFE>();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssertionUtil.AssertEqual(expectedParty, actualParty);
        }
    }
}