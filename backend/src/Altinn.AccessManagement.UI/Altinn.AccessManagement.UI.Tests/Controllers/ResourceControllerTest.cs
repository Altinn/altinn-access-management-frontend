using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Altinn.Common.PEP.Interfaces;
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
    ///     Tests for AccessManagmet Resource metadata
    /// </summary>
    [Collection("ResourceController Tests")]
    public class ResourceControllerTest : IClassFixture<CustomWebApplicationFactory<ResourceController>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<ResourceController> _factory;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ResourceControllerTest(CustomWebApplicationFactory<ResourceController> factory)
        {
            _factory = factory;
            _client = GetTestClient();
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: GetResources returns a list of resources
        ///     Expected: GetResources returns a list of resources with language filtered for the authenticated users selected
        ///     language
        /// </summary>
        [Fact]
        public async Task GetMaskinportenResources_valid()
        {
            // Arrange
            List<ServiceResourceFE> expectedResources = GetExpectedResources(ResourceType.MaskinportenSchema);

            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/resources/maskinportenschema");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResources, actualResources, AssertionUtil.AssertResourceExternalEqual);
        }

        /// <summary>
        ///     Test case: GetAllResourceOwners, returns a list of resource owners in string format
        ///     Expected: GetResources returns a list of resource owners with language filtered for the authenticated users
        ///     selected
        /// </summary>
        [Fact]
        public async Task GetAllResourceOwners_validresults()
        {
            // Arrange
            OrgList orgList = ResourceUtil.GetMockedResourceRegistryOrgList();
            List<ResourceOwnerFE> expectedResult = MapOrgListToResourceOwnersFE(orgList, "nb");

            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/resources/resourceowners");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            List<ResourceOwnerFE> actualResult = await response.Content.ReadAsAsync<List<ResourceOwnerFE>>();
            Assert.True(expectedResult.SequenceEqual(actualResult));
        }

        private List<ResourceOwnerFE> MapOrgListToResourceOwnersFE(OrgList orgList, string languageCode)
        {
            return orgList.Orgs.Values
                .Select(org => new ResourceOwnerFE(GetOrgNameInCorrectLanguage(org.Name, languageCode), org.Orgnr))
                .ToList();
        }

        private string GetOrgNameInCorrectLanguage(Name name, string languageCode)
        {
            switch (languageCode.ToLowerInvariant())
            {
                case "en":
                    return name.En;
                case "nb":
                    return name.Nb;
                case "nn":
                    return name.Nn;
                default:
                    return name.En;
            }
        }

        private static List<ServiceResourceFE> GetExpectedResources(ResourceType resourceType)
        {
            List<ServiceResourceFE> resources = new List<ServiceResourceFE>();
            resources = TestDataUtil.GetExpectedResources(resourceType);
            return resources;
        }

        private static IHttpContextAccessor GetHttpContextAccessorMock(string partytype, string id)
        {
            HttpContext httpContext = new DefaultHttpContext();
            httpContext.Request.RouteValues.Add(partytype, id);

            Mock<IHttpContextAccessor> httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            httpContextAccessorMock.Setup(h => h.HttpContext).Returns(httpContext);
            return httpContextAccessorMock.Object;
        }

        private HttpClient GetTestClient(IHttpContextAccessor httpContextAccessor = null)
        {
            httpContextAccessor ??= new HttpContextAccessor();
            HttpClient client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton<IProfileClient, ProfileClientMock>();
                    services.AddSingleton<IResourceClient, ResourceClientMock>();
                    services.AddSingleton(httpContextAccessor);
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                    services.AddSingleton<IPDP, PdpPermitMock>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            return client;
        }
    }
}
