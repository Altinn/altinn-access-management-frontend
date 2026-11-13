using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
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
        private const string IsBankruptcyEstateAdminUrl = "accessmanagement/api/v1/bankruptcyestate/isBankruptcyEstateAdmin";
        private const string AdministratorsUrl = "accessmanagement/api/v1/bankruptcyestate/administrators";

        private readonly HttpClient _client;
        private readonly string _testDataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="BankruptcyEstateControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public BankruptcyEstateControllerTest(CustomWebApplicationFactory<BankruptcyEstateController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            _testDataFolder = Path.Combine(
                Path.GetDirectoryName(new Uri(typeof(BankruptcyEstateControllerTest).Assembly.Location).LocalPath),
                "Data",
                "ExpectedResults",
                "BankruptcyEstate");
        }

        private void SetAuthHeader()
        {
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        private static async Task<List<(string Code, string Path)>> ReadValidationErrors(HttpResponseMessage response)
        {
            using JsonDocument body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            return body.RootElement.GetProperty("validationErrors").EnumerateArray()
                .Select(error => (error.GetProperty("code").GetString(), error.GetProperty("paths").EnumerateArray().Select(path => path.GetString()).FirstOrDefault()))
                .ToList();
        }

        /// <summary>
        /// Test case: IsBankruptcyEstateAdmin returns true for a party the mock reports as having bankruptcy estates.
        /// </summary>
        [Fact]
        public async Task IsBankruptcyEstateAdmin_ReturnsTrue()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{IsBankruptcyEstateAdminUrl}?party={party}");
            bool actualResponse = await response.Content.ReadFromJsonAsync<bool>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.True(actualResponse);
        }

        /// <summary>
        /// Test case: IsBankruptcyEstateAdmin with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task IsBankruptcyEstateAdmin_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{IsBankruptcyEstateAdminUrl}?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: IsBankruptcyEstateAdmin returns the backend status code and problem details when the client throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task IsBankruptcyEstateAdmin_ClientThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{IsBankruptcyEstateAdminUrl}?party={party}");
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: IsBankruptcyEstateAdmin returns internal server error when the client throws an unexpected exception.
        /// </summary>
        [Fact]
        public async Task IsBankruptcyEstateAdmin_ClientThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{IsBankruptcyEstateAdminUrl}?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetAdministrators returns the administrators from the mock, mapped for the frontend.
        /// </summary>
        [Fact]
        public async Task GetAdministrators_ReturnsAdministrators()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            string path = Path.Combine(_testDataFolder, "administrators.json");
            List<BankruptcyEstateAdministratorFE> expectedResponse = Util.GetMockData<List<BankruptcyEstateAdministratorFE>>(path);
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{AdministratorsUrl}?party={party}");
            List<BankruptcyEstateAdministratorFE> actualResponse = await response.Content.ReadFromJsonAsync<List<BankruptcyEstateAdministratorFE>>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(actualResponse);
            Assert.Equivalent(expectedResponse, actualResponse);
        }

        /// <summary>
        /// Test case: GetAdministrators with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task GetAdministrators_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{AdministratorsUrl}?party=not-a-guid");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetAdministrators returns the backend status code and problem details when the client throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task GetAdministrators_ClientThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{AdministratorsUrl}?party={party}");
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal((int)HttpStatusCode.NotFound, problemDetails.Status);
            Assert.Equal("Unexpected HttpStatus response", problemDetails.Title);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: GetAdministrators returns internal server error when the client throws an unexpected exception.
        /// </summary>
        [Fact]
        public async Task GetAdministrators_ClientThrowsException_ReturnsInternalServerError()
        {
            Guid party = Guid.Empty;
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{AdministratorsUrl}?party={party}");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAdministrator returns the assignment when valid person input is provided.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_ValidPersonInput_ReturnsAssignment()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "20838198385",
                LastName = "Medaljong",
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync($"{AdministratorsUrl}?party={party}", JsonContent.Create(personInput));
            AssignmentDto assignment = await response.Content.ReadFromJsonAsync<AssignmentDto>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(assignment);
            Assert.Equal(party, assignment.FromId);
            Assert.Equal(Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), assignment.ToId);
        }

        /// <summary>
        /// Test case: AddAdministrator returns a validation problem when the person identifier has an invalid format.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_InvalidPersonIdentifier_ReturnsValidationProblem()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput { PersonIdentifier = "20838198", LastName = "Medaljong" };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync($"{AdministratorsUrl}?party={party}", JsonContent.Create(personInput));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal([("AM.VLD-00034", "/personIdentifier")], await ReadValidationErrors(response));
        }

        /// <summary>
        /// Test case: AddAdministrator returns a validation problem when Access Management finds no person for the input.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_UnknownPerson_ReturnsValidationProblem()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput { PersonIdentifier = "20838198385", LastName = "Ukjent" };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync($"{AdministratorsUrl}?party={party}", JsonContent.Create(personInput));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal([("AM.VLD-00034", null)], await ReadValidationErrors(response));
        }

        /// <summary>
        /// Test case: AddAdministrator returns a required error per field when the input is empty after quotes are stripped.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_OnlyQuotesInPersonInput_ReturnsRequiredErrors()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            PersonInput personInput = new PersonInput { PersonIdentifier = "\"\"", LastName = "\"" };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync($"{AdministratorsUrl}?party={party}", JsonContent.Create(personInput));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Equal([("STD.VLD-00000", "/personIdentifier"), ("STD.VLD-00000", "/lastName")], await ReadValidationErrors(response));
        }

        /// <summary>
        /// Test case: AddAdministrator returns bad request when the person input has no fields.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_EmptyPersonInput_ReturnsBadRequest()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync($"{AdministratorsUrl}?party={party}", JsonContent.Create(new { }));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: AddAdministrator returns too many requests without a body when the API is rate limited.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_TooManyRequests_ReturnsTooManyRequests()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000429");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "20838198385",
                LastName = "Medaljong",
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync($"{AdministratorsUrl}?party={party}", JsonContent.Create(personInput));

            Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
            string responseContent = await response.Content.ReadAsStringAsync();
            Assert.True(string.IsNullOrWhiteSpace(responseContent));
        }

        /// <summary>
        /// Test case: AddAdministrator returns the backend status code and problem details when the client throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_ClientThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            PersonInput personInput = new PersonInput
            {
                PersonIdentifier = "20838198385",
                LastName = "Medaljong",
            };
            SetAuthHeader();

            HttpResponseMessage response = await _client.PostAsync($"{AdministratorsUrl}?party={party}", JsonContent.Create(personInput));
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }

        /// <summary>
        /// Test case: RemoveAdministrator returns no content for valid input.
        /// </summary>
        [Fact]
        public async Task RemoveAdministrator_ReturnsNoContent()
        {
            Guid party = Guid.Parse("cd35779b-b174-4ecc-bbef-ece13611be7f");
            Guid user = Guid.Parse("4aa1b6e1-609e-4e0e-af13-1074d62b3283");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync($"{AdministratorsUrl}?party={party}&user={user}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAdministrator with invalid party format returns bad request.
        /// </summary>
        [Fact]
        public async Task RemoveAdministrator_InvalidParty_ReturnsBadRequest()
        {
            Guid user = Guid.Parse("4aa1b6e1-609e-4e0e-af13-1074d62b3283");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync($"{AdministratorsUrl}?party=not-a-guid&user={user}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: RemoveAdministrator returns the backend status code and problem details when the client throws HttpStatusException.
        /// </summary>
        [Fact]
        public async Task RemoveAdministrator_ClientThrowsHttpStatusException_ReturnsProblemDetails()
        {
            Guid party = Guid.Parse("00000000-0000-0000-0000-000000000404");
            Guid user = Guid.Parse("4aa1b6e1-609e-4e0e-af13-1074d62b3283");
            SetAuthHeader();

            HttpResponseMessage response = await _client.DeleteAsync($"{AdministratorsUrl}?party={party}&user={user}");
            ProblemDetails problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.NotNull(problemDetails);
            Assert.Equal("Downstream message", problemDetails.Detail);
        }
    }
}
