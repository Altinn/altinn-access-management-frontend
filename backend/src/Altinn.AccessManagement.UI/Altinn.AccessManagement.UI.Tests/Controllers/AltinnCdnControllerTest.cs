using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
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
            _client = SetupUtils.GetTestClient(factory, null);

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
            // Arrange
            var emptyOrgData = new Dictionary<string, OrgData>();
            var testClient = GetTestClient(emptyOrgData);

            // Act
            var response = await testClient.GetAsync("accessmanagement/api/v1/cdn/orgdata");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var actualOrgData = await response.Content.ReadFromJsonAsync<Dictionary<string, OrgData>>();
            Assert.NotNull(actualOrgData);
            Assert.Empty(actualOrgData);
        }

        /// <summary>
        /// Test that when service throws an exception, controller returns 500 status code
        /// </summary>
        [Fact]
        public async Task GetOrgData_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var mockService = new Mock<IAltinnCdnService>();
            mockService.Setup(s => s.GetOrgData())
                .ThrowsAsync(new InvalidOperationException("Service error"));

            var testClient = GetTestClientWithExceptionService(mockService.Object);

            // Act
            var response = await testClient.GetAsync("accessmanagement/api/v1/cdn/orgdata");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("An error occurred while retrieving organization data", content);
        }




        /// <summary>
        /// Test that verifies data is cached after first request and subsequent requests use cached data
        /// </summary>
        [Fact]
        public async Task GetOrgData_CachesDataAfterFirstRequest_AndUsesCache()
        {
            // Arrange
            var expectedOrgData = new Dictionary<string, OrgData>
            {
                {
                    "cto",
                    new OrgData
                    {
                        Name = new Dictionary<string, string> { { "nb", "Cache Test Organization" } },
                        Logo = "/cache-logo.png",
                    }
                }
            };

            var mockCdnClient = new Mock<IAltinnCdnClient>();
            mockCdnClient.Setup(c => c.GetOrgData()).ReturnsAsync(expectedOrgData);

            var testClient = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton(mockCdnClient.Object);
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                    services.AddMemoryCache();
                    services.AddSingleton<IAltinnCdnService, AltinnCdnService>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            string token = PrincipalUtil.GetAccessToken("accessmanagement.api");
            testClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            testClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Act - First request (should cache the data)
            var response1 = await testClient.GetAsync("accessmanagement/api/v1/cdn/orgdata");

            // Act - Second request (should use cached data)
            var response2 = await testClient.GetAsync("accessmanagement/api/v1/cdn/orgdata");

            // Act - Third request (should still use cached data)
            var response3 = await testClient.GetAsync("accessmanagement/api/v1/cdn/orgdata");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response1.StatusCode);
            Assert.Equal(HttpStatusCode.OK, response2.StatusCode);
            Assert.Equal(HttpStatusCode.OK, response3.StatusCode);

            var actualOrgData1 = await response1.Content.ReadFromJsonAsync<Dictionary<string, OrgData>>();
            var actualOrgData2 = await response2.Content.ReadFromJsonAsync<Dictionary<string, OrgData>>();
            var actualOrgData3 = await response3.Content.ReadFromJsonAsync<Dictionary<string, OrgData>>();

            Assert.NotNull(actualOrgData1);
            Assert.NotNull(actualOrgData2);
            Assert.NotNull(actualOrgData3);
            Assert.Equal(expectedOrgData.Count, actualOrgData1.Count);
            Assert.Equal(expectedOrgData.Count, actualOrgData2.Count);
            Assert.Equal(expectedOrgData.Count, actualOrgData3.Count);

            // Verify the underlying client was called exactly once - proving cache is working
            mockCdnClient.Verify(c => c.GetOrgData(), Times.Once);
        }



        private HttpClient GetTestClientWithExceptionService(IAltinnCdnService mockService)
        {
            var httpClient = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton(mockService);
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            string token = PrincipalUtil.GetAccessToken("accessmanagement.api");
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return httpClient;
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

            string token = PrincipalUtil.GetAccessToken("accessmanagement.api");
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return httpClient;
        }
    }
}
