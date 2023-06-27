using System.Net;
using System.Net.Http.Headers;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
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
        private readonly ILookupClient _lookupClient;
        private readonly IRegisterClient _registerClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="LookupControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public LookupControllerTest(CustomWebApplicationFactory<LookupController> factory)
        {
            _factory = factory;
            _lookupClient = Mock.Of<ILookupClient>();
            _registerClient = new RegisterClientMock();
            _client = GetTestClient();
        }

        private HttpClient GetTestClient()
        {
            var httpClient = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton(sp => _lookupClient);
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

            Party actualParty = await response.Content.ReadAsAsync<Party>();
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
    }
}