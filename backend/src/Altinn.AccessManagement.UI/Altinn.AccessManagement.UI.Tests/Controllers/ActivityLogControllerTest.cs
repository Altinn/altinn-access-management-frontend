using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="ActivityLogController"/>: the routes, validation, authorization and
    /// error mapping, with one happy path per route for the serialization. What the client sends to
    /// the API is covered by <see cref="Clients.ActivityLogClientTest"/>.
    /// </summary>
    [Collection("ActivityLogController Tests")]
    public class ActivityLogControllerTest : IClassFixture<CustomWebApplicationFactory<ActivityLogController>>
    {
        private const string Party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
        private const string LiseLarsen = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
        private const string BaseUrl = "accessmanagement/api/v1/activitylog";

        private readonly HttpClient _client;
        private readonly string _mockDataFolder;
        private readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="ActivityLogControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ActivityLogControllerTest(CustomWebApplicationFactory<ActivityLogController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            _mockDataFolder = Path.Combine(
                Path.GetDirectoryName(new Uri(typeof(ActivityLogControllerTest).Assembly.Location).LocalPath),
                "Data",
                "ActivityLog");
        }

        private void SetAuthHeader()
        {
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        private async Task<T> GetOk<T>(string url)
        {
            HttpResponseMessage response = await _client.GetAsync(url);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            return await response.Content.ReadFromJsonAsync<T>(_options);
        }

        /// <summary>
        /// Test case: GetActivityLog returns the entries where the party gave access, newest first.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_FromDirection_ReturnsEntriesGivenByParty()
        {
            SetAuthHeader();
            List<ActivityLogDto> expected = Util.GetMockData<List<ActivityLogDto>>(Path.Combine(_mockDataFolder, "maskinporten.json"))
                .Where(entry => entry.FromId == Guid.Parse(Party))
                .OrderByDescending(entry => entry.When)
                .ToList();

            PaginatedResult<ActivityLogDto> actual = await GetOk<PaginatedResult<ActivityLogDto>>($"{BaseUrl}/maskinporten?party={Party}&direction=from");

            Assert.NotNull(actual);
            Assert.Null(actual.Links.Next);
            Assert.Equal(expected.Select(entry => entry.Id), actual.Items.Select(entry => entry.Id));
            Assert.Equivalent(expected, actual.Items.ToList());
        }

        /// <summary>
        /// Test case: GetActivityLog without a direction returns bad request.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_MissingDirection_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten?party={Party}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActivityLog without a party returns bad request.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_MissingParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten?direction=from");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActivityLog with an invalid party returns bad request.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_InvalidParty_ReturnsBadRequest()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten?party=not-a-guid&direction=from");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActivityLog for an unknown area returns not found.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_UnknownArea_ReturnsNotFound()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/consent?party={Party}&direction=from");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActivityLog without authentication returns unauthorized.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_NoToken_ReturnsUnauthorized()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten?party={Party}&direction=from");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActivityLog passes a downstream error status on as problem details.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_DownstreamError_ReturnsProblemDetails()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten?party=00000000-0000-0000-0000-000000000404&direction=from");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetFilterValues binds the search and term and returns the values of the field.
        /// </summary>
        [Fact]
        public async Task GetFilterValues_ReturnsValuesOfField()
        {
            SetAuthHeader();

            PaginatedResult<ActivityLogFilterValueDto> actual = await GetOk<PaginatedResult<ActivityLogFilterValueDto>>($"{BaseUrl}/maskinporten/filter/to?party={Party}&direction=from&term=lise");

            ActivityLogFilterValueDto value = Assert.Single(actual.Items);
            Assert.Equal(Guid.Parse(LiseLarsen), value.Id);
            Assert.Equal("Lise Larsen AS", value.Name);
        }

        /// <summary>
        /// Test case: GetFilterFields returns the fields the area offers, and is not mistaken for a
        /// lookup of the values of a field named "fields".
        /// </summary>
        [Fact]
        public async Task GetFilterFields_ReturnsFieldsOfArea()
        {
            SetAuthHeader();
            List<string> expected = Util.GetMockData<List<string>>(Path.Combine(_mockDataFolder, "maskinporten_filter_fields.json"));

            List<string> actual = await GetOk<List<string>>($"{BaseUrl}/maskinporten/filter/fields");

            Assert.NotNull(actual);
            Assert.Equal(expected, actual);
            Assert.Contains("To", actual);
            Assert.Contains("By", actual);
        }

        /// <summary>
        /// Test case: GetFilterFields for an unknown area returns not found.
        /// </summary>
        [Fact]
        public async Task GetFilterFields_UnknownArea_ReturnsNotFound()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/consent/filter/fields");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetFilterFields without authentication returns unauthorized.
        /// </summary>
        [Fact]
        public async Task GetFilterFields_NoToken_ReturnsUnauthorized()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten/filter/fields");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        /// <summary>
        /// Test case: GetActivityTypes returns the area's catalog.
        /// </summary>
        [Fact]
        public async Task GetActivityTypes_ReturnsCatalog()
        {
            SetAuthHeader();
            List<ActivityTypeDto> expected = Util.GetMockData<List<ActivityTypeDto>>(Path.Combine(_mockDataFolder, "maskinporten_types.json"));

            List<ActivityTypeDto> actual = await GetOk<List<ActivityTypeDto>>($"{BaseUrl}/maskinporten/types");

            Assert.NotNull(actual);
            Assert.Equivalent(expected, actual);
        }
    }
}
