using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Sockets;
using System.Text.Json;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Mocks.Mocks;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;
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
    /// Test class for <see cref="ActivityLogController"/>.
    /// </summary>
    [Collection("ActivityLogController Tests")]
    public class ActivityLogControllerTest : IClassFixture<CustomWebApplicationFactory<ActivityLogController>>
    {
        private const string Party = "cd35779b-b174-4ecc-bbef-ece13611be7f";
        private const string LiseLarsen = "167536b5-f8ed-4c5a-8f48-0279507e53ae";
        private const string FysioPartner = "21cc8752-4801-490d-a6ab-ab3266a0f748";
        private const string BaseUrl = "accessmanagement/api/v1/activitylog";

        private readonly CustomWebApplicationFactory<ActivityLogController> _factory;
        private readonly HttpClient _client;
        private readonly string _mockDataFolder;
        private readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="ActivityLogControllerTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ActivityLogControllerTest(CustomWebApplicationFactory<ActivityLogController> factory)
        {
            _factory = factory;
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
        /// Test case: GetActivityLog with direction "to" returns the entries where the party received access.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_ToDirection_ReturnsEntriesReceivedByParty()
        {
            SetAuthHeader();

            PaginatedResult<ActivityLogDto> actual = await GetOk<PaginatedResult<ActivityLogDto>>($"{BaseUrl}/maskinporten?party={Party}&direction=to");

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

            PaginatedResult<ActivityLogDto> first = await GetOk<PaginatedResult<ActivityLogDto>>($"{BaseUrl}/maskinporten?party={Party}&direction=from&to={FysioPartner}&pageNo=0&pageSize=1");
            PaginatedResult<ActivityLogDto> second = await GetOk<PaginatedResult<ActivityLogDto>>($"{BaseUrl}/maskinporten?party={Party}&direction=from&to={FysioPartner}&pageNo=1&pageSize=1");

            Assert.Single(first.Items);
            Assert.NotNull(first.Links.Next);
            Assert.Contains($"party={Party}", first.Links.Next);
            Assert.Contains("direction=from", first.Links.Next);
            Assert.Contains($"to={FysioPartner}", first.Links.Next);
            Assert.Contains("pageNo=1", first.Links.Next);
            Assert.Contains("pageSize=1", first.Links.Next);
            Assert.Single(second.Items);
            Assert.Null(second.Links.Next);
            Assert.All(first.Items.Concat(second.Items), entry => Assert.Equal(Guid.Parse(FysioPartner), entry.ToId));
        }

        /// <summary>
        /// Test case: GetActivityLog narrows to entries after the given time.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_After_ReturnsOnlyLaterEntries()
        {
            SetAuthHeader();

            PaginatedResult<ActivityLogDto> actual = await GetOk<PaginatedResult<ActivityLogDto>>($"{BaseUrl}/maskinporten?party={Party}&direction=from&after=2025-01-01T00:00:00Z");

            Assert.Equal(2, actual.Items.Count());
            Assert.All(actual.Items, entry => Assert.True(entry.When >= new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)));
        }

        /// <summary>
        /// Test case: GetActivityLog narrows to entries of the given activity types.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_TypeId_ReturnsOnlyMatchingTypes()
        {
            SetAuthHeader();
            Guid resourceRemoved = Guid.Parse("2cc78d26-16a1-4a88-95cd-3ca427fb0731");

            PaginatedResult<ActivityLogDto> actual = await GetOk<PaginatedResult<ActivityLogDto>>($"{BaseUrl}/maskinporten?party={Party}&direction=from&typeId={resourceRemoved}");

            Assert.Single(actual.Items);
            Assert.Equal(resourceRemoved, actual.Items.First().ActivityTypeId);
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
        /// Test case: GetFilterValues returns the distinct receivers for the party's given access.
        /// </summary>
        [Fact]
        public async Task GetFilterValues_To_ReturnsDistinctReceivers()
        {
            SetAuthHeader();

            PaginatedResult<ActivityLogFilterValueDto> actual = await GetOk<PaginatedResult<ActivityLogFilterValueDto>>($"{BaseUrl}/maskinporten/filter/to?party={Party}&direction=from");

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

            PaginatedResult<ActivityLogFilterValueDto> actual = await GetOk<PaginatedResult<ActivityLogFilterValueDto>>($"{BaseUrl}/maskinporten/filter/to?party={Party}&direction=from&term=lise");

            Assert.Single(actual.Items);
            Assert.Equal("Lise Larsen AS", actual.Items.First().Name);
        }

        /// <summary>
        /// Test case: a socket error towards the access management API is transient. The controller must not
        /// swallow it, so that the global filter can turn it into a 503 the caller may retry on.
        /// </summary>
        [Fact]
        public async Task GetActivityLog_SocketExceptionFromClient_ReturnsServiceUnavailable()
        {
            Mock<IActivityLogClient> client = new();
            client
                .Setup(c => c.GetActivityLog(It.IsAny<string>(), It.IsAny<ActivityLogQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new HttpRequestException(
                    "An error occurred while sending the request.",
                    new IOException("The response ended prematurely.", new SocketException((int)SocketError.ConnectionReset))));

            HttpClient throwingClient = GetTestClient(client.Object);
            throwingClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", PrincipalUtil.GetToken(1234, 1234, 2));

            HttpResponseMessage response = await throwingClient.GetAsync($"{BaseUrl}/maskinporten?party={Party}&direction=from");

            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        }

        private HttpClient GetTestClient(IActivityLogClient activityLogClient)
        {
            WebApplicationFactory<ActivityLogController> factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddTransient(_ => activityLogClient);
                    services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
                    services.AddSingleton<IPostConfigureOptions<JwtCookieOptions>, JwtCookiePostConfigureOptionsStub>();
                });
            });
            factory.Server.AllowSynchronousIO = true;
            return factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
        }
    }
}
