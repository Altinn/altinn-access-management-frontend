using System.Net;
using System.Net.Http;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.ActivityLog;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Tests.Clients
{
    /// <summary>
    /// Tests that <see cref="ActivityLogClient"/> sends the access management API the requests it
    /// expects: the area routes, every filter as a query parameter, and the headers.
    /// </summary>
    public class ActivityLogClientTest
    {
        private const string BaseUrl = "http://localhost:5117/accessmanagement/api/";
        private const string ApiUrl = BaseUrl + "v2/enduser/maskinporten/activitylog";

        private static readonly Guid _party = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private static readonly Guid _to = Guid.Parse("22222222-2222-2222-2222-222222222222");
        private static readonly Guid _by = Guid.Parse("33333333-3333-3333-3333-333333333333");
        private static readonly Guid _typeId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        private static readonly Guid _role = Guid.Parse("55555555-5555-5555-5555-555555555555");
        private static readonly Guid _package = Guid.Parse("66666666-6666-6666-6666-666666666666");
        private static readonly Guid _source = Guid.Parse("77777777-7777-7777-7777-777777777777");
        private static readonly Guid _resource = Guid.Parse("88888888-8888-8888-8888-888888888888");

        /// <summary>
        /// Handler that records the outgoing request and returns a fixed response.
        /// </summary>
        private sealed class RecordingHandler : HttpMessageHandler
        {
            private readonly string _responseContent;
            private readonly HttpStatusCode _statusCode;

            public RecordingHandler(string responseContent = "{\"data\":[],\"links\":{\"next\":null}}", HttpStatusCode statusCode = HttpStatusCode.OK)
            {
                _responseContent = responseContent;
                _statusCode = statusCode;
            }

            public HttpRequestMessage Request { get; private set; }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Request = request;
                return Task.FromResult(new HttpResponseMessage
                {
                    StatusCode = _statusCode,
                    Content = new StringContent(_responseContent),
                });
            }
        }

        private static ActivityLogClient CreateClient(RecordingHandler handler)
        {
            PlatformSettings platformSettings = new PlatformSettings
            {
                ApiAccessManagementEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            DefaultHttpContext httpContext = new DefaultHttpContext();
            httpContext.Request.Headers.Cookie = "AltinnStudioRuntime=user-token";

            return new ActivityLogClient(
                new HttpClient(handler),
                NullLogger<ActivityLogClient>.Instance,
                new HttpContextAccessor { HttpContext = httpContext },
                Options.Create(platformSettings));
        }

        [Fact]
        public async Task GetActivityLog_SendsAnchorOnly_WhenNothingElseIsSet()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(handler).GetActivityLog("maskinporten", new ActivityLogQuery { Party = _party, Direction = "from" });

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{ApiUrl}?party={_party}&direction=from", handler.Request.RequestUri.ToString());
            Assert.Equal("subscription-key", handler.Request.Headers.GetValues("Ocp-Apim-Subscription-Key").Single());
            Assert.Equal("Bearer user-token", handler.Request.Headers.GetValues("Authorization").Single());
        }

        [Fact]
        public async Task GetActivityLog_SendsEveryFilterAndPaging()
        {
            RecordingHandler handler = new RecordingHandler();
            ActivityLogQuery query = new ActivityLogQuery
            {
                Party = _party,
                Direction = "to",
                From = new List<Guid> { _to },
                By = new List<Guid> { _by },
                Role = new List<Guid> { _role },
                Package = new List<Guid> { _package },
                Resource = new List<Guid> { _resource },
                Source = new List<Guid> { _source },
                TypeId = new List<Guid> { _typeId },
                After = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.FromHours(1)),
                Before = new DateTimeOffset(2025, 1, 31, 23, 59, 59, 999, TimeSpan.FromHours(1)),
                PageNo = 2,
                PageSize = 50,
            };

            await CreateClient(handler).GetActivityLog("connections", query);

            Assert.Equal(
                $"{BaseUrl}v2/enduser/connections/activitylog?party={_party}&direction=to&from={_to}&by={_by}&role={_role}&package={_package}&resource={_resource}&source={_source}&typeId={_typeId}"
                + "&after=2025-01-01T00%3A00%3A00.0000000%2B01%3A00&before=2025-01-31T23%3A59%3A59.9990000%2B01%3A00&pageNo=2&pageSize=50",
                handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetActivityLog_RepeatsListParameters()
        {
            RecordingHandler handler = new RecordingHandler();
            ActivityLogQuery query = new ActivityLogQuery
            {
                Party = _party,
                Direction = "from",
                To = new List<Guid> { _to, _by },
            };

            await CreateClient(handler).GetActivityLog("maskinporten", query);

            Assert.Equal($"{ApiUrl}?party={_party}&direction=from&to={_to}&to={_by}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetActivityLog_ReturnsTheApiPage()
        {
            RecordingHandler handler = new RecordingHandler(
                "{\"data\":[{\"id\":\"a1000000-0000-4000-8000-000000000001\",\"type\":\"Assignment\",\"trigger\":\"Created\",\"when\":\"2025-02-23T14:15:00+01:00\",\"itemId\":\"b1000000-0000-4000-8000-000000000001\"}],\"links\":{\"next\":\"?party=x&pageNo=1\"}}");

            PaginatedResult<ActivityLogDto> result = await CreateClient(handler).GetActivityLog("maskinporten", new ActivityLogQuery { Party = _party, Direction = "from" });

            Assert.Equal("?party=x&pageNo=1", result.Links.Next);
            ActivityLogDto entry = Assert.Single(result.Items);
            Assert.Equal("Assignment", entry.Type);
            Assert.Equal("Created", entry.Trigger);
            Assert.Equal(new DateTimeOffset(2025, 2, 23, 14, 15, 0, TimeSpan.FromHours(1)), entry.When);
        }

        [Fact]
        public async Task GetFilterValues_SendsFieldTermAndOrder_WithTheSearch()
        {
            RecordingHandler handler = new RecordingHandler();
            ActivityLogFilterValuesQuery query = new ActivityLogFilterValuesQuery
            {
                Party = _party,
                Direction = "from",
                By = new List<Guid> { _by },
                Term = "lise larsen",
                OrderBy = "When",
                PageSize = 20,
            };

            await CreateClient(handler).GetFilterValues("maskinporten", "to", query);

            Assert.Equal(
                $"{ApiUrl}/filter/to?party={_party}&direction=from&by={_by}&pageSize=20&term=lise%20larsen&orderBy=When",
                handler.Request.RequestUri.AbsoluteUri);
        }

        [Fact]
        public async Task GetFilterValues_EscapesTheField()
        {
            RecordingHandler handler = new RecordingHandler();

            await CreateClient(handler).GetFilterValues("maskinporten", "to/../by", new ActivityLogFilterValuesQuery { Party = _party, Direction = "from" });

            Assert.StartsWith($"{ApiUrl}/filter/to%2F..%2Fby?", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task GetFilterFields_RequestsTheFieldsRoute()
        {
            RecordingHandler handler = new RecordingHandler("[\"From\",\"To\",\"By\"]");

            IEnumerable<string> fields = await CreateClient(handler).GetFilterFields("maskinporten");

            Assert.Equal($"{ApiUrl}/filter/fields", handler.Request.RequestUri.ToString());
            Assert.Equal(new[] { "From", "To", "By" }, fields);
        }

        [Fact]
        public async Task GetActivityLog_PassesAnErrorStatusOn()
        {
            RecordingHandler handler = new RecordingHandler(string.Empty, HttpStatusCode.NotFound);

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(handler).GetActivityLog("maskinporten", new ActivityLogQuery { Party = _party, Direction = "from" }));

            Assert.Equal(HttpStatusCode.NotFound, exception.StatusCode);
        }
    }
}
