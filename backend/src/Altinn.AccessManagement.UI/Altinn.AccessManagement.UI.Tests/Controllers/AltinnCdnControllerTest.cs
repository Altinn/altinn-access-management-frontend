using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="AltinnCdnController"/>
    /// </summary>
    [Collection("AltinnCdnController Tests")]
    public class AltinnCdnControllerTest : IClassFixture<CustomWebApplicationFactory<AltinnCdnController>>
    {
        private readonly CustomWebApplicationFactory<AltinnCdnController> _factory;
        
        private readonly HttpClient _client;

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public AltinnCdnControllerTest(CustomWebApplicationFactory<AltinnCdnController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(new CustomWebApplicationFactory<UserController>(), null);

            string token = PrincipalUtil.GetAccessToken("accessmanagement.api");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        /// Successfully get organization data
        /// </summary>
        [Fact]
        public async Task GetOrgData_ReturnsOrgData()
        {
            // Arrange
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(AltinnCdnControllerTest).Assembly.Location).LocalPath);
            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "AltinnCdn", "orgData.json");
            Dictionary<string, OrgData> expectedOrgData = Util.GetMockData<Dictionary<string, OrgData>>(path);


            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/cdn/orgdata");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var actualOrgData = await response.Content.ReadFromJsonAsync<Dictionary<string, OrgData>>();
            Assert.NotNull(actualOrgData);
            AssertionUtil.AssertEqual(expectedOrgData, actualOrgData);
        }

        /// <summary>
        /// Test that when service returns empty data, the endpoint returns empty dictionary
        /// </summary>
        [Fact]
        public async Task GetOrgData_ServiceReturnsEmptyData_ReturnsEmptyDictionary()
        {

            // Act
            var response = await _client.GetAsync("accessmanagement/api/v1/cdn/orgdata");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var actualOrgData = await response.Content.ReadFromJsonAsync<Dictionary<string, OrgData>>();
            Assert.NotNull(actualOrgData);
            Assert.Empty(actualOrgData);
        }

        private HttpClient GetTestClient(Dictionary<string, OrgData> orgDataToReturn)
        {
            var mockService = new Mock<IAltinnCdnService>();
            mockService.Setup(s => s.GetOrgData()).ReturnsAsync(orgDataToReturn);

            var httpClient = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton(mockService.Object);
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return httpClient;
        }

    }
}
