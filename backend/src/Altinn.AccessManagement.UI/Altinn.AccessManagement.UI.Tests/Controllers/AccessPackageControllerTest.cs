using System.IO;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Reflection;
using System.Text;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models;
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
            List<AccessAreaFE> expectedResult = Util.GetMockData<List<AccessAreaFE>>(_expectedDataPath + "/AccessPackage/Search/emptySearch.json");

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
            List<AccessAreaFE> expectedResult = Util.GetMockData<List<AccessAreaFE>>(_expectedDataPath + "/AccessPackage/Search/emptySearch.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/search?&searchString={searchString}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            List<AccessAreaFE> actualResources = JsonSerializer.Deserialize<List<AccessAreaFE>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult, actualResources, AssertionUtil.AssertEqual);
        }

        /// <summary>
        ///     Test case: Get all access packages for a valid right holder on behalf of a valid party 
        ///     Expected: Returns the right holders active access package delegations, sorted into the areas they belong to
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_ReturnsAccessPackages()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "167536b5-f8ed-4c5a-8f48-0279507e53ae"; // Valid user that has access package rights for the reportee
            Dictionary<string, List<AccessPackageDelegation>> expectedResult = Util.GetMockData<Dictionary<string, List<AccessPackageDelegation>>>(_expectedDataPath + $"/AccessPackage/GetDelegations/{rightHolderUuid}.json");

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Dictionary<string, List<AccessPackageDelegation>> actualResult = JsonSerializer.Deserialize<Dictionary<string, List<AccessPackageDelegation>>>(await response.Content.ReadAsStringAsync(), options);
            AssertionUtil.AssertCollections(expectedResult.Keys, actualResult.Keys, Assert.Equal);
            foreach (string key in actualResult.Keys)
            {
                AssertionUtil.AssertCollections(expectedResult[key], actualResult[key], AssertionUtil.AssertEqual);
            }
        }

        /// <summary>
        ///     Test case: The right owned is valid but has no access packages for the reportee party
        ///     Expected: Returns an empty Dictionary
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_RightHolderHasNoAccessPackages()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864837ff9"; // Valid right holder that has no access package rights for the reportee

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Dictionary<string, List<AccessPackageDelegation>> actualResult = JsonSerializer.Deserialize<Dictionary<string, List<AccessPackageDelegation>>>(await response.Content.ReadAsStringAsync(), options);
            Assert.Empty(actualResult.Keys);
        }

        /// <summary>
        ///     Test case: Backend returns a non-successfull status code
        ///     Expected: Returns a non-successfull status
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_BackendHttpError()
        {
            // Arrange
            string reporteeUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f"; // Valid reportee
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864800000"; // This right holder has no relationship to the party

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.False(response.IsSuccessStatusCode);

        }

        /// <summary>
        ///     Test case: Unexpected exception thrown in the BFF
        ///     Expected: Returns a 500 error
        /// </summary>
        [Fact]
        public async Task GetDelegationsToRightHolder_UnexpectedException()
        {
            // Arrange
            string reporteeUuid = "********"; // Input that will trigger that a mocked unexpected exception is thrown
            string rightHolderUuid = "26ca8b02-c455-4dc0-96be-f92864837ff9"; // Valid right holder that has no access package rights for the reportee

            // Act
            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/accesspackage/delegations/{reporteeUuid}/{rightHolderUuid}");

            // Assert
            Assert.False(response.IsSuccessStatusCode);
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

        }


        /// <summary>
        ///    Test case: Create a new access package delegation
        ///    Expected: Returns a 201 Created
        /// </summary>
        [Fact]
        public async Task CreateAccessPackageDelegation_ValidRequest_ReturnsCreated()
        {
            // Arrange
            var delegationInput = new DelegationInput
            {
                To = new List<IdValuePair>
                    {
                        new IdValuePair { Id = "urn:altinn:person:uuid", Value = "167536b5-f8ed-4c5a-8f48-0279507e53ae" }
                    },
                Rights = new List<Right>
                    {
                        new Right
                        {
                            Resource = new List<IdValuePair>
                            {
                                new IdValuePair { Id = "urn:altinn:accesspackage", Value = "3490203E-876E-4EF9-B774-9A0CD9B7E9CD" }
                            }
                        }
                    }
            };
            var party = "51329012";
            var jsonContent = JsonSerializer.Serialize(delegationInput);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/accesspackage/delegate/{party}", content);

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        /// <summary>
        ///    Test case: Create a new access package delegation with invalid input
        ///    Expected: Returns a 500 internal server error
        /// </summary>
        [Fact]
        public async Task CreateAccessPackageDelegation_UnexpectedException()
        {
            // Arrange
            var delegationInput = new DelegationInput
            {
                To = new List<IdValuePair>
                    {
                        new IdValuePair { Id = "urn:altinn:person:uuid", Value = "167536b5-f8ed-4c5a-8f48-0279507e53ae" }
                    },
                Rights = new List<Right>
                    {
                        new Right
                        {
                            Resource = new List<IdValuePair>
                            {
                                new IdValuePair { Id = "urn:altinn:accesspackage", Value = "3490203E-876E-4EF9-B774-9A0CD9B7E9CD" }
                            }
                        }
                    }
            };
            var party = "********";
            var jsonContent = JsonSerializer.Serialize(delegationInput);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/accesspackage/delegate/{party}", content);

            // Assert
            Assert.False(response.IsSuccessStatusCode);
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        ///    Test case: Create a new access package delegation with invalid input
        ///    Expected: Returns a 400 bad request
        /// </summary>
        [Fact]
        public async Task CreateAccessPackageDelegation_BadRequest()
        {
            // Arrange
            var delegationInput = new DelegationInput
            {
                To = new List<IdValuePair>
                    {
                        new IdValuePair { Id = "urn:altinn:person:uuid", Value = "167536b5-f8ed-4c5a-8f48-0279507e53ae" }
                    },
                Rights = new List<Right>
                    {
                        new Right
                        {
                            Resource = new List<IdValuePair>
                            {
                                new IdValuePair { Id = "urn:altinn:accesspackage", Value = "invalid_id" }
                            }
                        }
                    }
            };
            var party = "51329012";
            var jsonContent = JsonSerializer.Serialize(delegationInput);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Act
            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/accesspackage/delegate/{party}", content);

            // Assert
            Assert.False(response.IsSuccessStatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }


    }
}
