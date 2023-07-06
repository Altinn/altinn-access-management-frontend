﻿using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Altinn.Common.PEP.Interfaces;
using AltinnCore.Authentication.JwtCookie;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Microsoft.AspNetCore.Http;
using Moq;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Tests for AccessManagmet Resource metadata
    /// </summary>
    [Collection("ResourceController Tests")]
    public class ResourceControllerTest : IClassFixture<CustomWebApplicationFactory<ResourceController>>
    {
        private readonly CustomWebApplicationFactory<ResourceController> _factory;
        private HttpClient _client;

        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ResourceControllerTest(CustomWebApplicationFactory<ResourceController> factory)
        {
            _factory = factory;
            _client = GetTestClient();
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        /// Test case: GetResources returns a list of resources 
        /// Expected: GetResources returns a list of resources with language filtered for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetMaskinportenResources_valid()
        {
            // Arrange
            List<ServiceResourceFE> expectedResources = GetExpectedResources(ResourceType.MaskinportenSchema);

            var token = PrincipalUtil.GetToken(1337, 501337, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/maskinportenschema");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<List<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResources, actualResources, AssertionUtil.AssertResourceExternalEqual);
        }

        /// <summary>
        /// Test case: PaginatedSearch with pagination (no search string or filters)
        /// Expected: PaginatedSearch returns a list of all single rights resources in paginated form with language filtered for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_searchStringAndFilterNotSet_ReturnsAll()
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1337, 501337, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 7;

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources();
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/paginatedSearch?ResultsPerPage={resultsPerPage}&Page={page}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertResourceExternalEqual);
        }

        /// <summary>
        /// Test case: PaginatedSearch with pagination and filters
        /// Expected: PaginatedSearch returns a list of resources matching the filters in paginated form with language filtered for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_filterSet_ReturnsMatch()
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1337, 501337, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 4;
            string[] roFilters = { "narnia", "testdepartementet" };

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources().FindAll(r => roFilters.Contains(r.ResourceOwnerName.ToLower()));
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/paginatedSearch?ResultsPerPage={resultsPerPage}&Page={page}&ROFilters={roFilters[0]}&ROFilters={roFilters[1]}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertResourceExternalEqual);
        }

        /// <summary>
        /// Test case: PaginatedSearch with pagination and search string
        /// Expected: PaginatedSearch returns a list of resources matching the search string in paginated form with language filtered for the authenticated users selected language
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_searchStringSet_ReturnsMatch()
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1337, 501337, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 1;
            string searchString = "klesskapet";

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources().FindAll(r => r.Title.ToLower().Contains(searchString));
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/paginatedSearch?ResultsPerPage={resultsPerPage}&Page={page}&SearchString={searchString}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertResourceExternalEqual);
        }

        /// <summary>
        /// Test case: PaginatedSearch with search string and filters
        /// Expected: PaginatedSearch returns a list of resources matching the filters and search string, ordered by number of matches
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_searchStringAndFilterSet_ReturnsCorrectOrder()
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1337, 501337, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int page = 1;
            int resultsPerPage = 4;
            string searchString = "gir tilgang til brannbilen";
            string[] roFilters = { "brannvesenet", "testdepartementet" };

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources().FindAll(r => roFilters.Contains(r.ResourceOwnerName.ToLower()));
            // The most relevant resource to our search will be the Brannvesenet service, which is stored last
            // Thus we rearrenge the resources until they match expected output of the search
            ServiceResourceFE mostRelevantResource = allExpectedResources.Last();
            allExpectedResources.RemoveAt(allExpectedResources.Count - 1);
            allExpectedResources.Insert(0, mostRelevantResource);
            PaginatedList<ServiceResourceFE> expectedResult = new PaginatedList<ServiceResourceFE>(allExpectedResources.GetRange(0, resultsPerPage), page, allExpectedResources.Count);

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/paginatedSearch?ResultsPerPage={resultsPerPage}&Page={page}&SearchString={searchString}&ROFilters={roFilters[0]}&ROFilters={roFilters[1]}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            PaginatedList<ServiceResourceFE> actualResources = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Equal(expectedResult.Page, actualResources.Page);
            Assert.Equal(expectedResult.NumEntriesTotal, actualResources.NumEntriesTotal);
            AssertionUtil.AssertCollections(expectedResult.PageList, actualResources.PageList, AssertionUtil.AssertResourceExternalEqual);
        }

        /// <summary>
        /// Test case: Repeated call og PaginatedSearch to get all valid pages
        /// Expected: PaginatedSearch returns expected number of entires for all valid pages
        /// </summary>
        [Fact]
        public async Task GetSingleRightsSearch_noSearchStringAndFilters_ValidPagination()
        {
            // Arrange
            var token = PrincipalUtil.GetToken(1337, 501337, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            int resultsPerPage = 5;

            List<ServiceResourceFE> allExpectedResources = TestDataUtil.GetSingleRightsResources();

            int totalPages = (int) Math.Ceiling((double) allExpectedResources.Count/resultsPerPage);
            int resultsFinalPage = allExpectedResources.Count % resultsPerPage;

            List<PaginatedList<ServiceResourceFE>> allActualPages = new List<PaginatedList<ServiceResourceFE>>();

            // Act
            for (int i = 1; i <= totalPages; i++)
            {
                HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/resources/paginatedSearch?ResultsPerPage={resultsPerPage}&Page={i}");
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

            var httpContextAccessorMock = new Mock<IHttpContextAccessor>();
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
