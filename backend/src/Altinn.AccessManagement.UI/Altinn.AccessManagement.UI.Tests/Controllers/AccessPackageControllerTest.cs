using System.IO;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Reflection;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
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
    [Collection("AccessPackageController Tests")]
    public class AccessPackageControllerTest : IClassFixture<CustomWebApplicationFactory<AccessPackageController>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<AccessPackageController> _factory;
        private readonly JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        private readonly string _expectedDataPath = "Data/ExpectedResults";

        /// <summary>
        ///     Constructor setting up factory, test client and dependencies
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public AccessPackageControllerTest(CustomWebApplicationFactory<AccessPackageController> factory)
        {
            _factory = factory;
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetAccessToken("sbl.authorization");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        /// <summary>
        ///     Test case: Search with empty input
        ///     Expected: Search returns all access packages
        /// </summary>
        [Fact]
        public async Task GetSearch_EmptySearch()
        {
            // Arrange
            List<AccessAreaFE> expectedResult = Util.GetMockData<List<AccessAreaFE>>(_expectedDataPath + "/AccessPackage/emptySearch.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/accesspackage/search");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<AccessAreaFE> actualResources = JsonSerializer.Deserialize<List<AccessAreaFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Search with a set search string
        ///     Expected: Search returns all access packages matching search
        /// </summary>
        [Fact]
        public async Task GetSearch_withSearchString()
        {
            // Arrange
            string searchString = "a"; // Will return all packages in mocked data
            List<AccessAreaFE> expectedResult = Util.GetMockData<List<AccessAreaFE>>(_expectedDataPath + "/AccessPackage/emptySearch.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/search?&searchString={searchString}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<AccessAreaFE> actualResources = JsonSerializer.Deserialize<List<AccessAreaFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }
    }
}
