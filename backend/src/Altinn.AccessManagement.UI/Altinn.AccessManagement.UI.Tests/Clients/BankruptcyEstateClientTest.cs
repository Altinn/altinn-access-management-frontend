using System.Net;
using System.Net.Http;
using System.Text.Json;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.BankruptcyEstate;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Connections;
using Altinn.AccessManagement.UI.Integration.Clients;
using Altinn.AccessManagement.UI.Integration.Configuration;
using Altinn.Authorization.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Tests.Clients
{
    /// <summary>
    /// Tests that <see cref="BankruptcyEstateClient"/> calls the expected url and maps
    /// the downstream status codes to a result or an exception.
    /// </summary>
    public class BankruptcyEstateClientTest
    {
        private const string BaseUrl = "http://localhost:5117/accessmanagement/api/";
        private const string AdministratorsUrl = BaseUrl + "v1/enduser/bankruptcyestate/administrators";

        private static readonly Guid _party = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private static readonly Guid _user = Guid.Parse("22222222-2222-2222-2222-222222222222");

        /// <summary>
        /// Handler that records the outgoing request and returns a fixed response.
        /// </summary>
        private sealed class RecordingHandler : HttpMessageHandler
        {
            private readonly string _responseContent;
            private readonly HttpStatusCode _statusCode;

            public RecordingHandler(string responseContent = "true", HttpStatusCode statusCode = HttpStatusCode.OK)
            {
                _responseContent = responseContent;
                _statusCode = statusCode;
            }

            public HttpRequestMessage Request { get; private set; }

            public string RequestBody { get; private set; }

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Request = request;
                RequestBody = request.Content == null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
                return new HttpResponseMessage
                {
                    StatusCode = _statusCode,
                    Content = new StringContent(_responseContent),
                };
            }
        }

        private static BankruptcyEstateClient CreateClient(RecordingHandler handler)
        {
            PlatformSettings platformSettings = new PlatformSettings
            {
                ApiAccessManagementEndpoint = BaseUrl,
                SubscriptionKeyHeaderName = "Ocp-Apim-Subscription-Key",
                SubscriptionKey = "subscription-key",
                JwtCookieName = "AltinnStudioRuntime",
            };

            return new BankruptcyEstateClient(
                new HttpClient(handler),
                NullLogger<BankruptcyEstateClient>.Instance,
                new HttpContextAccessor { HttpContext = new DefaultHttpContext() },
                Options.Create(platformSettings));
        }

        [Fact]
        public async Task HasAnyEstates_CallsEstatesAnyUrl()
        {
            RecordingHandler handler = new RecordingHandler();

            bool result = await CreateClient(handler).HasAnyEstates(_party);

            Assert.True(result);
            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{BaseUrl}v1/enduser/bankruptcyestate/estates/any?party={_party}", handler.Request.RequestUri.ToString());
        }

        /// <summary>
        /// A party without estates is answered with Forbidden downstream. That is a normal
        /// outcome for the UI, not an error, so it must come back as false.
        /// </summary>
        [Fact]
        public async Task HasAnyEstates_ForbiddenReturnsFalse()
        {
            RecordingHandler handler = new RecordingHandler(string.Empty, HttpStatusCode.Forbidden);

            bool result = await CreateClient(handler).HasAnyEstates(_party);

            Assert.False(result);
        }

        [Fact]
        public async Task HasAnyEstates_ThrowsOnErrorResponse()
        {
            RecordingHandler handler = new RecordingHandler("upstream is down", HttpStatusCode.InternalServerError);

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(handler).HasAnyEstates(_party));

            Assert.Equal(HttpStatusCode.InternalServerError, exception.StatusCode);
        }

        [Fact]
        public async Task GetAdministrators_CallsAdministratorsUrlAndReturnsItems()
        {
            const string responseContent = """
                {
                  "links": { "next": null },
                  "data": [
                    {
                      "administrator": { "id": "4aa1b6e1-609e-4e0e-af13-1074d62b3283", "name": "KURSIV FOSSEKALL", "type": "Person" },
                      "adminrole": { "id": "e8f2e3bc-41e8-4ea6-87d3-3308934d471d", "code": "innbygger-konkursbo-administrator" },
                      "adminaddedat": "2026-03-02T08:30:00+00:00"
                    }
                  ]
                }
                """;
            RecordingHandler handler = new RecordingHandler(responseContent);

            List<BankruptcyEstateAdministrator> result = (await CreateClient(handler).GetAdministrators(_party)).ToList();

            Assert.Equal(HttpMethod.Get, handler.Request.Method);
            Assert.Equal($"{AdministratorsUrl}?party={_party}", handler.Request.RequestUri.ToString());
            BankruptcyEstateAdministrator administrator = Assert.Single(result);
            Assert.Equal("KURSIV FOSSEKALL", administrator.Administrator.Name);
            Assert.Equal("innbygger-konkursbo-administrator", administrator.AdminRole.Code);
            Assert.Equal(new DateTimeOffset(2026, 3, 2, 8, 30, 0, TimeSpan.Zero), administrator.AdminAddedAt);
        }

        [Fact]
        public async Task GetAdministrators_EmptyItemsReturnsEmptyList()
        {
            RecordingHandler handler = new RecordingHandler("""{ "links": { "next": null }, "data": null }""");

            IEnumerable<BankruptcyEstateAdministrator> result = await CreateClient(handler).GetAdministrators(_party);

            Assert.Empty(result);
        }

        /// <summary>
        /// Unlike the access check, the administrator list is only requested after the access check has
        /// passed, so a Forbidden answer here is an error and must not be swallowed.
        /// </summary>
        [Fact]
        public async Task GetAdministrators_ThrowsOnErrorResponse()
        {
            RecordingHandler handler = new RecordingHandler("no access", HttpStatusCode.Forbidden);

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(handler).GetAdministrators(_party));

            Assert.Equal(HttpStatusCode.Forbidden, exception.StatusCode);
        }

        [Fact]
        public async Task AddAdministrator_PostsPersonInputAndReturnsAssignment()
        {
            const string responseContent = """
                {
                  "id": "99999999-9999-9999-9999-999999999999",
                  "roleId": "e8f2e3bc-41e8-4ea6-87d3-3308934d471d",
                  "fromId": "11111111-1111-1111-1111-111111111111",
                  "toId": "22222222-2222-2222-2222-222222222222"
                }
                """;
            RecordingHandler handler = new RecordingHandler(responseContent);
            PersonInput personInput = new PersonInput { PersonIdentifier = "20814098533", LastName = "GÅSTOL" };

            AssignmentDto result = (await CreateClient(handler).AddAdministrator(_party, personInput)).Value;

            Assert.Equal(HttpMethod.Post, handler.Request.Method);
            Assert.Equal($"{AdministratorsUrl}?party={_party}", handler.Request.RequestUri.ToString());
            Assert.Equal("application/json", handler.Request.Content.Headers.ContentType.MediaType);
            using JsonDocument body = JsonDocument.Parse(handler.RequestBody);
            Assert.Equal("20814098533", body.RootElement.GetProperty("PersonIdentifier").GetString());
            Assert.Equal("GÅSTOL", body.RootElement.GetProperty("LastName").GetString());
            Assert.Equal(_user, result.ToId);
            Assert.Equal(_party, result.FromId);
        }

        /// <summary>
        /// A validation error the UI has a message for is an answer the user can act on,
        /// so it comes back as a problem and not as an exception.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_ValidationErrorReturnsProblem()
        {
            const string responseContent = """
            {
              "status": 400,
              "validationErrors": [ { "code": "AM.VLD-00034", "detail": "Given external identifiers yielded empty result." } ]
            }
            """;
            RecordingHandler handler = new RecordingHandler(responseContent, HttpStatusCode.BadRequest);
            PersonInput personInput = new PersonInput { PersonIdentifier = "20814098533", LastName = "GÅSTOL" };

            Result<AssignmentDto> result = await CreateClient(handler).AddAdministrator(_party, personInput);

            Assert.True(result.IsProblem);
            ValidationProblemInstance problem = Assert.IsType<ValidationProblemInstance>(result.Problem);
            Assert.Equal("AM.VLD-00034", Assert.Single(problem.Errors).ErrorCode.ToString());
        }

        [Fact]
        public async Task AddAdministrator_ThrowsOnBadRequestWithoutKnownValidationError()
        {
            const string responseContent = """{ "status": 400, "title": "Bad Request" }""";
            RecordingHandler handler = new RecordingHandler(responseContent, HttpStatusCode.BadRequest);
            PersonInput personInput = new PersonInput { PersonIdentifier = "20814098533", LastName = "GÅSTOL" };

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(handler).AddAdministrator(_party, personInput));

            Assert.Equal(HttpStatusCode.BadRequest, exception.StatusCode);
            Assert.Equal(responseContent, exception.Message);
        }

        /// <summary>
        /// Statuses other than a known validation error, such as Conflict, are still thrown
        /// with the response body, so the controller can pass the status on.
        /// </summary>
        [Fact]
        public async Task AddAdministrator_ThrowsWithResponseBodyOnErrorResponse()
        {
            const string responseContent = """{ "title": "Person is already an administrator" }""";
            RecordingHandler handler = new RecordingHandler(responseContent, HttpStatusCode.Conflict);
            PersonInput personInput = new PersonInput { PersonIdentifier = "20814098533", LastName = "GÅSTOL" };

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(handler).AddAdministrator(_party, personInput));

            Assert.Equal(HttpStatusCode.Conflict, exception.StatusCode);
            Assert.Equal(responseContent, exception.Message);
        }

        [Fact]
        public async Task RemoveAdministrator_CallsDeleteWithPartyAndUser()
        {
            RecordingHandler handler = new RecordingHandler(string.Empty, HttpStatusCode.NoContent);

            await CreateClient(handler).RemoveAdministrator(_party, _user);

            Assert.Equal(HttpMethod.Delete, handler.Request.Method);
            Assert.Equal($"{AdministratorsUrl}?party={_party}&user={_user}", handler.Request.RequestUri.ToString());
        }

        [Fact]
        public async Task RemoveAdministrator_ThrowsOnErrorResponse()
        {
            RecordingHandler handler = new RecordingHandler("not an administrator", HttpStatusCode.NotFound);

            HttpStatusException exception = await Assert.ThrowsAsync<HttpStatusException>(
                () => CreateClient(handler).RemoveAdministrator(_party, _user));

            Assert.Equal(HttpStatusCode.NotFound, exception.StatusCode);
            Assert.Equal("not an administrator", exception.Message);
        }
    }
}
