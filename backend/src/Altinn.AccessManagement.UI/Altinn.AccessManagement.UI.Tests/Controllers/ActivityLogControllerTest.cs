using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="ActivityLogController"/>.
    /// </summary>
    [Collection("ActivityLogController Tests")]
    public class ActivityLogControllerTest : IClassFixture<CustomWebApplicationFactory<ActivityLogController>>
    {
        private const string Party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
        private const string LiseLarsen = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
        private const string FysioPartner = "21cc8752-4801-490d-a6ab-ab3266a0f748";
        private const string BaseUrl = "accessmanagement/api/v1/activitylog";

        private readonly HttpClient _client;
        private readonly string _mockDataFolder;
        private readonly JsonSerializerOptions _options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() },
        };

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

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten?party={Party}&direction=from");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            PaginatedResult<ActivityLogDto> actual = await response.Content.ReadFromJsonAsync<PaginatedResult<ActivityLogDto>>(_options);

            Assert.NotNull(actual);
            Assert.Null(actual.Links.Next);
            Assert.Equal(expected.Select(entry => entry.Id), actual.Items.Select(entry => entry.Id));
            Assert.Equivalent(expected, actual.Items.ToList());
        }

        /// <summary>
        /// Test case: GetActivityLog with direction "to" returns the entries where the party received access.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_ToDirection_ReturnsEntriesReceivedByParty()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten?party={Party}&direction=to");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            PaginatedResult<ActivityLogDto> actual = await response.Content.ReadFromJsonAsync<PaginatedResult<ActivityLogDto>>(_options);

            Assert.NotNull(actual);
            Assert.All(actual.Items, entry => Assert.Equal(Guid.Parse(Party), entry.ToId));
            Assert.Single(actual.Items);
        }

        /// <summary>
        /// Test case: GetActivityLog narrows to the given counterparts and pages the result.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_CounterpartFilterAndPaging_ReturnsPage()
        {
            SetAuthHeader();

            HttpResponseMessage firstPage = await _client.GetAsync($"{BaseUrl}/maskinporten?party={Party}&direction=from&to={FysioPartner}&pageNo=0&pageSize=1");
            HttpResponseMessage secondPage = await _client.GetAsync($"{BaseUrl}/maskinporten?party={Party}&direction=from&to={FysioPartner}&pageNo=1&pageSize=1");

            Assert.Equal(HttpStatusCode.OK, firstPage.StatusCode);
            Assert.Equal(HttpStatusCode.OK, secondPage.StatusCode);
            PaginatedResult<ActivityLogDto> first = await firstPage.Content.ReadFromJsonAsync<PaginatedResult<ActivityLogDto>>(_options);
            PaginatedResult<ActivityLogDto> second = await secondPage.Content.ReadFromJsonAsync<PaginatedResult<ActivityLogDto>>(_options);

            Assert.Single(first.Items);
            Assert.NotNull(first.Links.Next);
            Assert.Single(second.Items);
            Assert.Null(second.Links.Next);
            Assert.All(first.Items.Concat(second.Items), entry => Assert.Equal(Guid.Parse(FysioPartner), entry.ToId));
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
        /// Test case: GetFilterValues returns the distinct receivers for the party's given access.
        /// </summary>
        [Fact]
        public async Task GetFilterValues_To_ReturnsDistinctReceivers()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten/filter/to?party={Party}&direction=from");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            PaginatedResult<ActivityLogFilterValueDto> actual = await response.Content.ReadFromJsonAsync<PaginatedResult<ActivityLogFilterValueDto>>(_options);

            Assert.NotNull(actual);
            Assert.Equal(
                new[] { (Guid.Parse(FysioPartner), "Fysio Partner AS"), (Guid.Parse(LiseLarsen), "Lise Larsen AS") },
                actual.Items.Select(value => (value.Id, value.Name)));
        }

        /// <summary>
        /// Test case: GetFilterValues matches the term on the name only.
        /// </summary>
        [Fact]
        public async Task GetFilterValues_Term_NarrowsByName()
        {
            SetAuthHeader();

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten/filter/to?party={Party}&direction=from&term=lise");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            PaginatedResult<ActivityLogFilterValueDto> actual = await response.Content.ReadFromJsonAsync<PaginatedResult<ActivityLogFilterValueDto>>(_options);

            Assert.Single(actual.Items);
            Assert.Equal("Lise Larsen AS", actual.Items.First().Name);
        }

        /// <summary>
        /// Test case: GetActivityTypes returns the area's catalog.
        /// </summary>
        [Fact]
        public async Task GetActivityTypes_ReturnsCatalog()
        {
            SetAuthHeader();
            List<ActivityTypeDto> expected = Util.GetMockData<List<ActivityTypeDto>>(Path.Combine(_mockDataFolder, "maskinporten_types.json"));

            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/maskinporten/types");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            List<ActivityTypeDto> actual = await response.Content.ReadFromJsonAsync<List<ActivityTypeDto>>(_options);

            Assert.NotNull(actual);
            Assert.Equivalent(expected, actual);
        }
    }
}
