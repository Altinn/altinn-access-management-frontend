using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="MaskinportenController"/>.
    /// </summary>
    [Collection("MaskinportenController Tests")]
    public class MaskinportenControllerTest : IClassFixture<CustomWebApplicationFactory<MaskinportenController>>
    {
        private readonly HttpClient _client;
        private readonly string _testDataFolder;
        private readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public MaskinportenControllerTest(CustomWebApplicationFactory<MaskinportenController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            _testDataFolder = Path.Combine(
                Path.GetDirectoryName(new Uri(typeof(MaskinportenControllerTest).Assembly.Location).LocalPath),
                "Data",
                "ExpectedResults",
                "Maskinporten");
        }

        private void SetAuthHeader()
        {
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        /// <summary>
        /// Test case: SearchScopes returns only Maskinporten schema resources.
        /// </summary>
        [Fact]
        public async Task SearchScopes_ReturnsOnlyMaskinportenSchemas()
        {
            SetAuthHeader();
            int page = 1;
            int resultsPerPage = 20;
            List<ServiceResourceFE> expectedResources = TestDataUtil.GetExpectedResources(ResourceType.MaskinportenSchema);

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/scopes/search?ResultsPerPage={resultsPerPage}&Page={page}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            PaginatedList<ServiceResourceFE> actualResponse = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), _options);

            Assert.NotNull(actualResponse);
            Assert.Equal(page, actualResponse.Page);
            Assert.Equal(expectedResources.Count, actualResponse.NumEntriesTotal);
            Assert.All(actualResponse.PageList, resource => Assert.Equal(ResourceType.MaskinportenSchema, resource.ResourceType));
            Assert.All(actualResponse.PageList, resource => Assert.True(resource.Visible));
        }

        /// <summary>
        /// Test case: SearchScopes matches scope references and weights exact matches.
        /// </summary>
        [Fact]
        public async Task SearchScopes_SearchStringMatchesScopeReference()
        {
            SetAuthHeader();
            string searchString = "nav:paa/v1/luring";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/scopes/search?ResultsPerPage=10&Page=1&SearchString={Uri.EscapeDataString(searchString)}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            PaginatedList<ServiceResourceFE> actualResponse = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), _options);

            Assert.NotNull(actualResponse);
            ServiceResourceFE resource = Assert.Single(actualResponse.PageList);
            Assert.Equal("appid-400", resource.Identifier);
            Assert.Equal(3, resource.PriorityCounter);
            Assert.Contains(resource.ResourceReferences, reference => reference.Reference == searchString);
        }

        /// <summary>
        /// Test case: SearchScopes ignores non-scope resource references.
        /// </summary>
        [Fact]
        public async Task SearchScopes_SearchStringIgnoresNonScopeReferences()
        {
            SetAuthHeader();
            string searchString = "AppId:400";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/scopes/search?ResultsPerPage=10&Page=1&SearchString={Uri.EscapeDataString(searchString)}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            PaginatedList<ServiceResourceFE> actualResponse = JsonSerializer.Deserialize<PaginatedList<ServiceResourceFE>>(await response.Content.ReadAsStringAsync(), _options);

            Assert.NotNull(actualResponse);
            Assert.Empty(actualResponse.PageList);
            Assert.Equal(0, actualResponse.NumEntriesTotal);
        }

        /// <summary>
        /// Test case: ResourceDelegationCheck returns delegation check for a Maskinporten scope resource.
        /// </summary>
        [Fact]
        public async Task ResourceDelegationCheck_ReturnsValid()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string resource = "appid-400";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/resources/delegationcheck?party={party}&resource={resource}");
            ResourceCheckDto actualResponse = await response.Content.ReadFromJsonAsync<ResourceCheckDto>(_options);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equal(resource, actualResponse.Resource.RefId);
            RightCheck right = Assert.Single(actualResponse.Rights);
            Assert.True(right.Result);
            Assert.Equal("ScopeAccess", right.Right.Name);
        }

        /// <summary>
        /// Test case: AddSupplierResource delegates a Maskinporten scope resource to a supplier.
        /// </summary>
        [Fact]
        public async Task AddSupplierResource_ReturnsTrue()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string supplier = "312605031";
            string resource = "appid-400";

            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}&supplier={supplier}&resource={resource}", null);
            bool actualResponse = await response.Content.ReadFromJsonAsync<bool>(_options);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.True(actualResponse);
        }

        /// <summary>
        /// Test case: GetSupplierResources returns delegated Maskinporten scope resources.
        /// </summary>
        [Fact]
        public async Task GetSupplierResources_ReturnsResources()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string supplier = "312605031";
            string resource = "appid-400";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}&supplier={supplier}&resource={resource}");
            List<ResourceDelegation> actualResponse = await response.Content.ReadFromJsonAsync<List<ResourceDelegation>>(_options);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            ResourceDelegation resourceDelegation = Assert.Single(actualResponse);
            Assert.Equal(resource, resourceDelegation.Resource.Identifier);
            Assert.Equal(ResourceType.MaskinportenSchema, resourceDelegation.Resource.ResourceType);
        }

        /// <summary>
        /// Test case: RemoveSupplierResource removes a Maskinporten scope resource from a supplier.
        /// </summary>
        [Fact]
        public async Task RemoveSupplierResource_ReturnsNoContent()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string supplier = "312605031";
            string resource = "appid-400";

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}&supplier={supplier}&resource={resource}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: ResourceDelegationCheck with invalid party format returns bad request (ModelState invalid).
        /// </summary>
        [Fact]
        public async Task ResourceDelegationCheck_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/maskinporten/resources/delegationcheck?party=not-a-guid&resource=appid-400");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetSupplierResources with invalid party format returns bad request (ModelState invalid).
        /// </summary>
        [Fact]
        public async Task GetSupplierResources_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/maskinporten/suppliers/resources?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddSupplierResource with invalid party format returns bad request (ModelState invalid).
        /// </summary>
        [Fact]
        public async Task AddSupplierResource_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync("accessmanagement/api/v1/maskinporten/suppliers/resources?party=not-a-guid&supplier=312605031&resource=appid-400", null);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveSupplierResource with invalid party format returns bad request (ModelState invalid).
        /// </summary>
        [Fact]
        public async Task RemoveSupplierResource_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync("accessmanagement/api/v1/maskinporten/suppliers/resources?party=not-a-guid&supplier=312605031&resource=appid-400");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: ResourceDelegationCheck returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task ResourceDelegationCheck_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/resources/delegationcheck?party={party}&resource=appid-400");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
        }

        /// <summary>
        /// Test case: ResourceDelegationCheck returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task ResourceDelegationCheck_ServiceThrowsException_ReturnsInternalServerError()
        {
            SetAuthHeader();
            Guid party = Guid.Empty;

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/resources/delegationcheck?party={party}&resource=appid-400");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddSupplierResource returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task AddSupplierResource_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");

            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}&supplier=312605031&resource=appid-400", null);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
        }

        /// <summary>
        /// Test case: AddSupplierResource returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task AddSupplierResource_ServiceThrowsException_ReturnsInternalServerError()
        {
            SetAuthHeader();
            Guid party = Guid.Empty;

            HttpResponseMessage response = await _client.PostAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}&supplier=312605031&resource=appid-400", null);

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetSupplierResources returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task GetSupplierResources_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
        }

        /// <summary>
        /// Test case: GetSupplierResources returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task GetSupplierResources_ServiceThrowsException_ReturnsInternalServerError()
        {
            SetAuthHeader();
            Guid party = Guid.Empty;

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveSupplierResource returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task RemoveSupplierResource_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}&supplier=312605031&resource=appid-400");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
        }

        /// <summary>
        /// Test case: RemoveSupplierResource returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task RemoveSupplierResource_ServiceThrowsException_ReturnsInternalServerError()
        {
            SetAuthHeader();
            Guid party = Guid.Empty;

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/suppliers/resources?party={party}&supplier=312605031&resource=appid-400");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetSuppliers returns the expected suppliers for a party.
        /// </summary>
        [Fact]
        public async Task GetSuppliers_ReturnsSuppliers()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string path = Path.Combine(_testDataFolder, "suppliers.json");
            List<MaskinportenConnection> expectedResponse = Util.GetMockData<List<MaskinportenConnection>>(path);
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/suppliers?party={party}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            List<MaskinportenConnection> actualResponse = await response.Content.ReadFromJsonAsync<List<MaskinportenConnection>>();

            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetConsumers returns the expected consumers for a party.
        /// </summary>
        [Fact]
        public async Task GetConsumers_ReturnsConsumers()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string path = Path.Combine(_testDataFolder, "consumers.json");
            List<MaskinportenConnection> expectedResponse = Util.GetMockData<List<MaskinportenConnection>>(path);
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/consumers?party={party}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            List<MaskinportenConnection> actualResponse = await response.Content.ReadFromJsonAsync<List<MaskinportenConnection>>();

            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetSuppliers with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task GetSuppliers_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/maskinporten/suppliers?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetConsumers with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task GetConsumers_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/maskinporten/consumers?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetSuppliers returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task GetSuppliers_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/suppliers?party={party}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: GetSuppliers returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task GetSuppliers_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/suppliers?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetConsumers returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task GetConsumers_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/consumers?party={party}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: GetConsumers returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task GetConsumers_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/consumers?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddSupplier returns the created assignment for a valid party and supplier.
        /// </summary>
        [Fact]
        public async Task AddSupplier_ReturnsAssignment()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string supplier = "312605031";
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}&supplier={supplier}",
                null);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            AssignmentDto actualResponse = await response.Content.ReadFromJsonAsync<AssignmentDto>();

            Assert.NotNull(actualResponse);
            Assert.NotEqual(Guid.Empty, actualResponse.Id);
            Assert.Equal(party, actualResponse.FromId);
        }

        /// <summary>
        /// Test case: AddSupplier with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task AddSupplier_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                "accessmanagement/api/v1/maskinporten/suppliers?party=not-a-guid&supplier=312605031",
                null);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddSupplier with missing required supplier parameter returns bad request.
        /// </summary>
        [Fact]
        public async Task AddSupplier_MissingSupplier_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}",
                null);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddSupplier returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task AddSupplier_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}&supplier=312605031",
                null);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: AddSupplier returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task AddSupplier_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}&supplier=312605031",
                null);

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveSupplier returns 204 No Content for a valid party and supplier.
        /// </summary>
        [Fact]
        public async Task RemoveSupplier_ReturnsNoContent()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string supplier = "312605031";
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}&supplier={supplier}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveSupplier with cascade=true returns 204 No Content.
        /// </summary>
        [Fact]
        public async Task RemoveSupplier_WithCascade_ReturnsNoContent()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string supplier = "312605031";
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}&supplier={supplier}&cascade=true");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveSupplier with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveSupplier_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                "accessmanagement/api/v1/maskinporten/suppliers?party=not-a-guid&supplier=312605031");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveSupplier with missing required supplier parameter returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveSupplier_MissingSupplier_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveSupplier returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task RemoveSupplier_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}&supplier=312605031");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: RemoveSupplier returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task RemoveSupplier_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/suppliers?party={party}&supplier=312605031");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumer returns 204 No Content for a valid party and consumer.
        /// </summary>
        [Fact]
        public async Task RemoveConsumer_ReturnsNoContent()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string consumer = "312605031";
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/consumers?party={party}&consumer={consumer}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumer with cascade=true returns 204 No Content.
        /// </summary>
        [Fact]
        public async Task RemoveConsumer_WithCascade_ReturnsNoContent()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string consumer = "312605031";
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/consumers?party={party}&consumer={consumer}&cascade=true");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumer with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveConsumer_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                "accessmanagement/api/v1/maskinporten/consumers?party=not-a-guid&consumer=312605031");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumer with missing required consumer parameter returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveConsumer_MissingConsumer_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/consumers?party={party}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumer returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task RemoveConsumer_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/consumers?party={party}&consumer=312605031");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: RemoveConsumer returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task RemoveConsumer_ServiceThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync(
                $"accessmanagement/api/v1/maskinporten/consumers?party={party}&consumer=312605031");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetConsumerResources returns delegated Maskinporten scope resources from the supplier perspective.
        /// </summary>
        [Fact]
        public async Task GetConsumerResources_ReturnsResources()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string consumer = "312605031";

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}&consumer={consumer}");
            List<ResourceDelegation> actualResponse = await response.Content.ReadFromJsonAsync<List<ResourceDelegation>>(_options);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            ResourceDelegation resourceDelegation = Assert.Single(actualResponse);
            Assert.Equal("appid-400", resourceDelegation.Resource.Identifier);
            Assert.Equal(ResourceType.MaskinportenSchema, resourceDelegation.Resource.ResourceType);
        }

        /// <summary>
        /// Test case: GetConsumerResources with invalid party format returns bad request (ModelState invalid).
        /// </summary>
        [Fact]
        public async Task GetConsumerResources_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync("accessmanagement/api/v1/maskinporten/consumers/resources?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetConsumerResources returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task GetConsumerResources_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
        }

        /// <summary>
        /// Test case: GetConsumerResources returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task GetConsumerResources_ServiceThrowsException_ReturnsInternalServerError()
        {
            SetAuthHeader();
            Guid party = Guid.Empty;

            HttpResponseMessage response = await _client.GetAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumerResource returns 204 No Content for a valid party, consumer and resource.
        /// </summary>
        [Fact]
        public async Task RemoveConsumerResource_ReturnsNoContent()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string consumer = "312605031";
            string resource = "appid-400";

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}&consumer={consumer}&resource={resource}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumerResource with invalid party format returns bad request (ModelState invalid).
        /// </summary>
        [Fact]
        public async Task RemoveConsumerResource_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync("accessmanagement/api/v1/maskinporten/consumers/resources?party=not-a-guid&consumer=312605031&resource=appid-400");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumerResource with missing required consumer parameter returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveConsumerResource_MissingConsumer_ReturnsBadRequest()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}&resource=appid-400");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumerResource with missing required resource parameter returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveConsumerResource_MissingResource_ReturnsBadRequest()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}&consumer=312605031");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveConsumerResource returns the backend status code and problem details when service throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task RemoveConsumerResource_ServiceThrowsHttpStatusException_ReturnsProblemDetails()
        {
            SetAuthHeader();
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}&consumer=312605031&resource=appid-400");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
        }

        /// <summary>
        /// Test case: RemoveConsumerResource returns internal server error when service throws.
        /// </summary>
        [Fact]
        public async Task RemoveConsumerResource_ServiceThrowsException_ReturnsInternalServerError()
        {
            SetAuthHeader();
            Guid party = Guid.Empty;

            HttpResponseMessage response = await _client.DeleteAsync($"accessmanagement/api/v1/maskinporten/consumers/resources?party={party}&consumer=312605031&resource=appid-400");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }
    }
}
