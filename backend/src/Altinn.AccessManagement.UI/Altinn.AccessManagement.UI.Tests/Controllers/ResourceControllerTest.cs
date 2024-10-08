﻿using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services;
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
        private readonly ResourceService _resourceService;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string mockFolder;

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ResourceControllerTest(CustomWebApplicationFactory<ResourceController> factory)
        {
            _factory = factory;
            _client = GetTestClient();
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _resourceService = new ResourceService();
            mockFolder = Path.GetDirectoryName(new Uri(typeof(ResourceRegistryClientMock).Assembly.Location).LocalPath);
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
            List<ServiceResourceFE> expectedResources = TestDataUtil.GetExpectedResources(ResourceType.MaskinportenSchema);

            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/resources/maskinportenapi/search");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResources, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: PaginatedSearch with pagination (no search string or filters)
        ///     Expected: PaginatedSearch returns a list of all single rights resources in paginated form with language filtered
        ///     for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_searchStringAndFilterNotSet_ReturnsAll()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 7;

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources();
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/search?ResultsPerPage={resultsPerPage}&Page={page}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertEqual);
        }


        /// <summary>
        ///     Test case: PaginatedSearch with pagination and filters
        ///     Expected: PaginatedSearch returns a list of resources matching the filters in paginated form with language filtered
        ///     for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_filterSet_ReturnsMatch()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 4;
            // Narnia and testdepartementet
            string[] roFilters = { "777777777", "974760746" };

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources().FindAll(r => roFilters.Contains(r.ResourceOwnerOrgNumber));
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/search?ResultsPerPage={resultsPerPage}&Page={page}&ROFilters={roFilters[0]}&ROFilters={roFilters[1]}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertEqual);
        }
        

        /// <summary>
        ///     Test case: PaginatedSearch with pagination and search string
        ///     Expected: PaginatedSearch returns a list of resources matching the search string in paginated form with language
        ///     filtered for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_searchStringSet_ReturnsMatch()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 1;
            string searchString = "klesskapet";

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources().FindAll(r => r.Title.ToLower().Contains(searchString));
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/search?ResultsPerPage={resultsPerPage}&Page={page}&SearchString={searchString}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: PaginatedSearch with pagination and search string 
        ///     Expected: PaginatedSearch returns a list of resources matching on keyword the search string in paginated form with language
        ///     filtered for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_searchStringSet_ReturnsKeywordMatch()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Add("Cookie", "selectedLanguage=no_nb");
            int page = 1;
            int resultsPerPage = 1;
            string searchString = "klesskapet_kw";

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources();
            List<ServiceResourceFE> filterd = allExpectedResources.FindAll(r => r.Keywords != null && r.Keywords.Any(kw => kw.Equals(searchString, StringComparison.CurrentCultureIgnoreCase)));
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(filterd.GetRange(0, resultsPerPage), page, filterd.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/search?ResultsPerPage={resultsPerPage}&Page={page}&SearchString={searchString}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: PaginatedSearch with search string and filters
        ///     Expected: PaginatedSearch returns a list of resources matching the filters and search string, ordered by number of
        ///     matches
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_searchStringAndFilterSet_ReturnsCorrectOrder()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 4;
            string searchString = "gir tilgang til brannbilen";
            // Brannvesenet and Testdepartementet
            string[] roFilters = { "110110110", "974760746" };

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources().FindAll(r => roFilters.Contains(r.ResourceOwnerOrgNumber));
            // The most relevant resource to our search will be the Brannvesenet service, which is stored last
            // Thus we rearrange the resources until they match expected output of the search
            ServiceResourceFE mostRelevantResource = allExpectedResources.Last();
            allExpectedResources.RemoveAt(allExpectedResources.Count - 1);
            allExpectedResources.Insert(0, mostRelevantResource);
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/search?ResultsPerPage={resultsPerPage}&Page={page}&SearchString={searchString}&ROFilters={roFilters[0]}&ROFilters={roFilters[1]}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Repeated call og PaginatedSearch to get all valid pages
        ///     Expected: PaginatedSearch returns expected number of entires for all valid pages
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_noSearchStringAndFilters_ValidPagination()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int resultsPerPage = 5;

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources();

            int totalPages = (int)Math.Ceiling((double)allExpectedResources.Count / resultsPerPage);
            int resultsFinalPage = allExpectedResources.Count % resultsPerPage;

            List<PaginatedList<ServiceResourceFE>> allActualPages = new List<PaginatedList<ServiceResourceFE>>();

            // Act
            for (int i = 1; i <= totalPages; i++)
            {
                HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/search?ResultsPerPage={resultsPerPage}&Page={i}");
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    allActualPages.Add(JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options));
                }
            }

            // Assert

            Assert.Equal(totalPages, allActualPages.Count);

            for (int i = 0; i < totalPages; i++)
            {
                if (i == totalPages - 1)
                {
                    Assert.Equal(resultsFinalPage, allActualPages[i].PageList.Count);
                }
                else
                {
                    Assert.Equal(resultsPerPage, allActualPages[i].PageList.Count);
                }
                Assert.Equal(allExpectedResources.Count, allActualPages[i].NumEntriesTotal);
            }
        }

        /// <summary>
        ///     Test case: GetAllResourceOwners, returns a simplified list of resource owners
        ///     Expected: GetAllResourceOwners returns a list of resource owners in correct language, ordered alphabetically
        /// </summary>
        [Fact]
        public async Task GetAllResourceOwners_validresults()
        {
            // Arrange
            string unitTestFolder = Path.GetDirectoryName(new Uri(typeof(ResourceControllerTest).Assembly.Location).LocalPath);
            string path = Path.Combine(unitTestFolder, "Data", "ExpectedResults", "ResourceRegistry", "resourceOwnersOrgList.json");
            List<ResourceOwnerFE> expectedResult = Util.GetMockData<List<ResourceOwnerFE>>(path).OrderBy(resorceOwner => resorceOwner.OrganisationName).ToList(); // order alphabetically

            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/resources/resourceowners");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            List<ResourceOwnerFE> actualResult = await response.Content.ReadFromJsonAsync<List<ResourceOwnerFE>>();
            for (int i = 0; i < expectedResult.Count; i++)
            {
                Assert.Equal(expectedResult[i], actualResult[i]);
            }
        }

        /// <summary>
        ///     Test case: GetResourceOwners, returns a simplified list of resource owners that have resources of type MaskinportenSchema
        ///     Expected: GetResourceOwners returns a list of resource owners in correct language, with MaskinportenSchema, ordered alphabetically
        /// </summary>
        [Fact]
        public async Task GetResourceOwners_resourceTypeMaskinPortenSchemAndAltinn2Service()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            List<ResourceType> relevantResourceTypes = new List<ResourceType>
            {
                ResourceType.Altinn2Service,
                ResourceType.MaskinportenSchema
            };

            List<ResourceOwnerFE> expectedResult = new List<ResourceOwnerFE>
            {
                new ResourceOwnerFE("BLOMSTERFINN", "994598759"),
                new ResourceOwnerFE("NARNIA", "777777777"),
                new ResourceOwnerFE("PÅFUNNSETATEN", "985399077"),
                new ResourceOwnerFE("Skatteetaten", "974761076"),
                new ResourceOwnerFE("Testdepartementet", "974760746"),
            };

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/resourceowners?relevantResourceTypes={relevantResourceTypes[0]}&relevantResourceTypes={relevantResourceTypes[1]}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ResourceOwnerFE> actualResult = JsonSerializer.Deserialize<List<ResourceOwnerFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertEqual(expectedResult, actualResult);
        }

        /// <summary>
        ///     Test case: Search for maskinporten schemas (no search string or filters)
        ///     Expected: Search returns a list of all maskinporten schemas for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task MaskinportenschemaSearch_searchStringAndFilterNotSet_ReturnsAll()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            List<ServiceResourceFE> expectedResult = TestDataUtil.GetExpectedResources(ResourceType.MaskinportenSchema);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/maskinportenapi/search");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Search for maskinporten schemas with filters
        ///     Expected: Search returns a list of all maskinporten schemas for the authenticated users selected language matching the provided filters
        /// </summary>
        [Fact]
        public async Task MaskinportenschemaSearch_filterSet_ReturnsMatches()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            // NARNIA
            string[] roFilters = { "777777777" };

            List<ServiceResourceFE> expectedResult = TestDataUtil.GetExpectedResources(ResourceType.MaskinportenSchema).FindAll(r => roFilters.Contains(r.ResourceOwnerOrgNumber));

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/maskinportenapi/search?ROFilters={roFilters[0]}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Search for maskinporten schemas with search
        ///     Expected: Search returns a list of resources matching the filters and with language filtered
        ///     for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task MaskinportenschemaSearch_searchStringSet_ReturnsMatches()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string searchString = "klesskapet";

            List<ServiceResourceFE> expectedResult = TestDataUtil.GetExpectedResources(ResourceType.MaskinportenSchema).FindAll(r => r.Title.ToLower().Contains(searchString));

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/maskinportenapi/search?&SearchString={searchString}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Search for maskinporten schemas with search and filter
        ///     Expected: Returns a list of maskinporten schemas matching the provided filters and search string with correct chosen language
        /// </summary>
        [Fact]
        public async Task MaskinportenschemaSearch_searchStringAndFilterSet_ReturnsMatches()
        {
            // Arrange
            string token = PrincipalUtil.GetToken(1337, 501337);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            string searchString = "det magiske klesskapet";
            // PÅFUNNSETATEN and NARNIA
            string[] roFilters = { "130000000", "777777777" };

            List<ServiceResourceFE> expectedResult = TestDataUtil.GetExpectedResources(ResourceType.MaskinportenSchema).FindAll(r => roFilters.Contains(r.ResourceOwnerOrgNumber));

            List<ServiceResourceFE> filteredExpectedResult = expectedResult.FindAll(r => r.Title.ToLower().Contains(searchString));

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/maskinportenapi/search?&SearchString={searchString}&ROFilters={roFilters[0]}&ROFilters={roFilters[1]}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(filteredExpectedResult, actualResources, AssertionUtil.AssertEqual);
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
                    services.AddSingleton<IResourceRegistryClient, ResourceRegistryClientMock>();
                    services.AddSingleton(httpContextAccessor);
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                    services.AddSingleton<IPDP, PdpPermitMock>();
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            return client;
        }
    }
}
