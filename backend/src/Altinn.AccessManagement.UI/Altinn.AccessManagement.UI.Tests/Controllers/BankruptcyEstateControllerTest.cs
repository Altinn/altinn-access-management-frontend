using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="BankruptcyEstateController"></see>
    /// </summary>
    [Collection("BankruptcyEstateController Tests")]
    public class BankruptcyEstateControllerTest : IClassFixture<CustomWebApplicationFactory<BankruptcyEstateController>>
    {
        private const string HasAdminAccessUrl = "accessmanagement/api/v1/bankruptcyestate/hasadminaccess";

        private readonly HttpClient _client;

        /// <summary>
        /// Initializes a new instance of the <see cref="BankruptcyEstateControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public BankruptcyEstateControllerTest(CustomWebApplicationFactory<BankruptcyEstateController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
        }

        private void SetAuthHeader()
        {
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        /// <summary>
        /// Test case: HasAdminAccess returns true for a party the mock reports as having bankruptcy estates.
        /// </summary>
        [Fact]
        public async Task HasAdminAccess_ReturnsTrue()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{HasAdminAccessUrl}?party={party}");
            bool actualResponse = await response.Content.ReadFromJsonAsync<bool>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.True(actualResponse);
        }

        /// <summary>
        /// Test case: HasAdminAccess with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task HasAdminAccess_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{HasAdminAccessUrl}?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: HasAdminAccess returns the backend status code and problem details when the client throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task HasAdminAccess_ClientThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{HasAdminAccessUrl}?party={party}");
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: HasAdminAccess returns internal server error when the client throws an unexpected exception.
        /// </summary>
        [Fact]
        public async Task HasAdminAccess_ClientThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{HasAdminAccessUrl}?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }
    }
}