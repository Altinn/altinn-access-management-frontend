using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
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
    }
}
