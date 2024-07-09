using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Platform.Profile.Models;
using Altinn.Platform.Register.Enums;
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
    /// Test class for <see cref="LookupController"/>
    /// </summary>
    [Collection("LookupController Tests")]
    public class LookupControllerTest : IClassFixture<CustomWebApplicationFactory<LookupController>>
    {
        private readonly CustomWebApplicationFactory<LookupController> _factory;
        private readonly HttpClient _client;
        private readonly IAccessManagementClient _accessManagementClient;
        private readonly IRegisterClient _registerClient;

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

            Party actualParty = await response.Content.ReadFromJsonAsync<Party>();
            Assert.Equal(lookupOrgNo, actualParty.OrgNumber);
            Assert.Equal(50004222, actualParty.PartyId);
            Assert.Equal(PartyType.Organisation, actualParty.PartyTypeName);
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
        /// Assert that an authenticated user is able to lookup a party based on uuid
        /// </summary>
        [Fact]
        public async Task GetPartyByUUID_Success()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1337, 501337));
            Guid lookupUUID = new Guid("60fb3d5b-99c2-4df0-aa77-f3fca3bc5199");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/lookup/party/{lookupUUID}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Party actualParty = await response.Content.ReadFromJsonAsync<Party>();
            Assert.Equal(lookupUUID, actualParty.PartyUuid);
            Assert.Equal(51317934, actualParty.PartyId);
            Assert.Equal(PartyType.Organisation, actualParty.PartyTypeName);
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

            UserProfile actualUser = await response.Content.ReadFromJsonAsync<UserProfile>();
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
    }
}