using System.Net;
using System.Net.Http.Headers;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="ReporteeController"/>
    /// </summary>
    [Collection("ReporteeController Tests")]
    public class ReporteeControllerTest : IClassFixture<CustomWebApplicationFactory<ReporteeController>>
    {
        // PartyUuid present in the reportee-list mock for user 1234 (Narnia Economics).
        private const string ValidPartyUuidInList = "1feb089d-6d08-d38a-a85d-6d4fe709ceb0";
        private const int ValidPartyIdInList = 81373770;

        // PartyId backed by a fixture under Data/ReporteeList/GetPartyFromReporteeList/.
        private const int ValidLookupPartyId = 51329012;
        private const string ValidLookupPartyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";

        private const string AltinnGoTo = "https://am.ui.tt02.altinn.no/some/page";
        private const string AltinnCloudGoTo = "https://am.ui.at22.altinn.cloud/some/page";
        private const string ForeignGoTo = "https://evil.example.com/steal";

        private readonly HttpClient _client;

        public ReporteeControllerTest(CustomWebApplicationFactory<ReporteeController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
        }

        private void Authenticate()
        {
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        private static string Encode(string url) => Uri.EscapeDataString(url);

        [Fact]
        public async Task ChangeAndRedirect_LegacyP_ValidParty_RedirectsAndSetsCookies()
        {
            Authenticate();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?P={ValidPartyUuidInList}&goTo={Encode(AltinnGoTo)}");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal(AltinnGoTo, response.Headers.Location.OriginalString);

            IEnumerable<string> cookies = response.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyId={ValidPartyIdInList}"));
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyUuid={ValidPartyUuidInList}"));
        }

        [Fact]
        public async Task ChangeAndRedirect_PartyUuid_ValidParty_RedirectsAndSetsCookies()
        {
            Authenticate();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?partyUuid={ValidPartyUuidInList}&goTo={Encode(AltinnGoTo)}");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal(AltinnGoTo, response.Headers.Location.OriginalString);

            IEnumerable<string> cookies = response.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyId={ValidPartyIdInList}"));
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyUuid={ValidPartyUuidInList}"));
        }

        [Fact]
        public async Task ChangeAndRedirect_PartyId_ValidParty_RedirectsAndSetsCookies()
        {
            Authenticate();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?partyId={ValidLookupPartyId}&goTo={Encode(AltinnGoTo)}");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal(AltinnGoTo, response.Headers.Location.OriginalString);

            IEnumerable<string> cookies = response.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyId={ValidLookupPartyId}"));
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyUuid={ValidLookupPartyUuid}"));
        }

        [Fact]
        public async Task ChangeAndRedirect_PartyUuidNotInReporteeList_RedirectsToErrorPageWithoutCookies()
        {
            Authenticate();
            string unknownUuid = Guid.NewGuid().ToString();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?P={unknownUuid}&goTo={Encode(AltinnGoTo)}");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal("/accessmanagement/ui/errorpage/reportee", response.Headers.Location.OriginalString);
            Assert.False(response.Headers.Contains("Set-Cookie") &&
                         response.Headers.GetValues("Set-Cookie").Any(c => c.StartsWith("AltinnParty")));
        }

        [Fact]
        public async Task ChangeAndRedirect_NoPartyInputs_RedirectsToErrorPage()
        {
            Authenticate();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?goTo={Encode(AltinnGoTo)}");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal("/accessmanagement/ui/errorpage/reportee", response.Headers.Location.OriginalString);
        }

        [Fact]
        public async Task ChangeAndRedirect_GoToOnDisallowedHost_FallsBackToFrontendBaseUrl_ButStillSetsCookies()
        {
            Authenticate();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?P={ValidPartyUuidInList}&goTo={Encode(ForeignGoTo)}");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.NotEqual(ForeignGoTo, response.Headers.Location.OriginalString);

            IEnumerable<string> cookies = response.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.StartsWith("AltinnPartyId="));
            Assert.Contains(cookies, c => c.StartsWith("AltinnPartyUuid="));
        }

        [Fact]
        public async Task ChangeAndRedirect_GoToMalformed_FallsBackToFrontendBaseUrl()
        {
            Authenticate();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?P={ValidPartyUuidInList}&goTo=not-a-url");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.NotEqual("not-a-url", response.Headers.Location.OriginalString);
        }

        [Fact]
        public async Task ChangeAndRedirect_GoToOnAltinnCloud_IsAllowed()
        {
            Authenticate();

            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?P={ValidPartyUuidInList}&goTo={Encode(AltinnCloudGoTo)}");

            Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
            Assert.Equal(AltinnCloudGoTo, response.Headers.Location.OriginalString);
        }

        [Fact]
        public async Task Change_PartyUuid_ValidParty_Returns200AndSetsCookies()
        {
            Authenticate();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/reportee/change?partyUuid={ValidPartyUuidInList}",
                content: null);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            IEnumerable<string> cookies = response.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyId={ValidPartyIdInList}"));
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyUuid={ValidPartyUuidInList}"));
        }

        [Fact]
        public async Task Change_PartyId_ValidParty_Returns200AndSetsCookies()
        {
            Authenticate();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/reportee/change?partyId={ValidLookupPartyId}",
                content: null);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            IEnumerable<string> cookies = response.Headers.GetValues("Set-Cookie");
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyId={ValidLookupPartyId}"));
            Assert.Contains(cookies, c => c.StartsWith($"AltinnPartyUuid={ValidLookupPartyUuid}"));
        }

        [Fact]
        public async Task Change_PartyNotInReporteeList_Returns403WithoutCookies()
        {
            Authenticate();
            string unknownUuid = Guid.NewGuid().ToString();

            HttpResponseMessage response = await _client.PostAsync(
                $"accessmanagement/api/v1/reportee/change?partyUuid={unknownUuid}",
                content: null);

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.False(response.Headers.Contains("Set-Cookie") &&
                         response.Headers.GetValues("Set-Cookie").Any(c => c.StartsWith("AltinnParty")));
        }

        [Fact]
        public async Task Change_NoPartyInputs_Returns400()
        {
            Authenticate();

            HttpResponseMessage response = await _client.PostAsync(
                "accessmanagement/api/v1/reportee/change",
                content: null);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task ChangeAndRedirect_Unauthenticated_DoesNotRedirectToGoTo()
        {
            HttpResponseMessage response = await _client.GetAsync(
                $"accessmanagement/api/v1/reportee/changeandredirect?P={ValidPartyUuidInList}&goTo={Encode(AltinnGoTo)}");

            // Without auth the [Authorize] filter should challenge — the endpoint must not honour the supplied goTo.
            if (response.StatusCode == HttpStatusCode.Redirect)
            {
                Assert.NotEqual(AltinnGoTo, response.Headers.Location.OriginalString);
            }
            else
            {
                Assert.True(
                    response.StatusCode == HttpStatusCode.Unauthorized ||
                    response.StatusCode == HttpStatusCode.Forbidden);
            }
        }
    }
}
