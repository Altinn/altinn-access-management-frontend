using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
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
            List<MaskinportenConnection> actualResponse = await response.Content.ReadFromJsonAsync<List<MaskinportenConnection>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
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
            List<MaskinportenConnection> actualResponse = await response.Content.ReadFromJsonAsync<List<MaskinportenConnection>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
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
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
    }
}
