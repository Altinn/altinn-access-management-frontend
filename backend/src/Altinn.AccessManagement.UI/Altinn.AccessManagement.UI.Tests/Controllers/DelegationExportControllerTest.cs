using System.Collections.Concurrent;
using System.IO.Compression;
using System.Net;
using System.Net.Http.Headers;
using System.Reflection;
using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.AccessManagement.UI.Tests.Utils;

namespace Altinn.AccessManagement.UI.Tests.Controllers
{
    /// <summary>
    /// Test class for <see cref="DelegationExportController"/>.
    /// </summary>
    [Collection("DelegationExportController Tests")]
    public class DelegationExportControllerTest : IClassFixture<CustomWebApplicationFactory<DelegationExportController>>
    {
        // Top-level organization in user 1234's reportee-list mock (DISKRET NÆR TIGER AS), which also has a subunit.
        private const string OrgPartyUuid = "cd35779b-b174-4ecc-bbef-ece13611be7f";
        private const string OrgNumber = "310202398";
        private const string SubunitOrgNumber = "311312294";

        // A person in the same reportee list (Vanessa Schmitt) — export must be rejected for persons.
        private const string PersonPartyUuid = "2efabf71-9f1f-b583-3d0e-9e091dc58476";

        // A uuid that is not in the reportee list.
        private const string UnknownPartyUuid = "11111111-1111-1111-1111-111111111111";

        // A party UUID that is in the reportee list as an organization and acts as the standard
        // HttpStatusException trigger in all four backend client mocks.
        private const string BackendErrorPartyUuid = "00000000-0000-0000-0000-000000000404";

        private const string RoleFile = "roller.csv";
        private const string AccessPackageFile = "tilgangspakker.csv";
        private const string SingleRightFile = "enkelttjenester.csv";
        private const string InstanceFile = "enkelttjenester-instans.csv";
        private const string BaseUrl = "accessmanagement/api/v1/delegationexport";

        private readonly HttpClient _client;

        /// <summary>
        /// Initializes a new instance of the <see cref="DelegationExportControllerTest"/> class.
        /// </summary>
        /// <param name="factory">The web application factory.</param>
        public DelegationExportControllerTest(CustomWebApplicationFactory<DelegationExportController> factory)
        {
            _client = SetupUtils.GetTestClient(factory);
            string token = PrincipalUtil.GetToken(1234, 1234, 2);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        [Fact]
        public async Task Export_OrganizationParty_ReturnsZipWithCsvEntries()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={OrgPartyUuid}&types=instances&includeSubunits=false");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/zip", response.Content.Headers.ContentType?.MediaType);
            Assert.Contains($"{OrgNumber}", response.Content.Headers.ContentDisposition?.FileNameStar ?? response.Content.Headers.ContentDisposition?.FileName ?? string.Empty);

            Dictionary<string, string> entries = await ReadZipEntries(response);

            // Only the requested type is exported.
            Assert.Equal(new[] { InstanceFile }, entries.Keys);
            string csv = entries[InstanceFile];

            // Header present (UTF-8 BOM is allowed before it).
            Assert.Contains("Organisasjonsnummer;Organisasjonsnavn;Tjenestenavn;Mottakernavn;Fødselsdato/Organisasjonsnummer;Mottakertype;Ressurs-ID;Instans-ID", csv);

            // Data from the instance mock: recipient is a person -> birth date as dd.MM.yyyy (1981-03-20).
            Assert.Contains("20.03.1981", csv);
            Assert.Contains(OrgNumber, csv);

            // includeSubunits=false: no rows from the subunit giver.
            Assert.DoesNotContain(SubunitOrgNumber, csv);
        }

        [Fact]
        public async Task Export_SingleRightsType_ReturnsPopulatedCsv()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={OrgPartyUuid}&types=singlerights&includeSubunits=false");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Dictionary<string, string> entries = await ReadZipEntries(response);
            Assert.Equal(new[] { SingleRightFile }, entries.Keys);

            string csv = entries[SingleRightFile];
            Assert.Contains("Organisasjonsnummer;Organisasjonsnavn;Tjenestenavn;Mottakernavn;Fødselsdato/Organisasjonsnummer;Mottakertype;Ressurs-ID", csv);

            // The single-right delegations mock has direct (non-via) permissions to this recipient.
            Assert.Contains("SITRONGUL MEDALJONG", csv);

            // More than just the header row.
            Assert.True(csv.Split('\n', StringSplitOptions.RemoveEmptyEntries).Length > 1);
        }

        [Fact]
        public async Task Export_AllTypes_ReturnsAllFourPopulatedCsvFiles()
        {
            // Default types (= all). Main org only, since the role/package mocks have to=null
            // fixtures for cd35779b but not for its subunit.
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={OrgPartyUuid}&includeSubunits=false");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Dictionary<string, string> entries = await ReadZipEntries(response);

            string[] expectedFiles = { RoleFile, AccessPackageFile, SingleRightFile, InstanceFile };
            Assert.Equal(expectedFiles.OrderBy(f => f), entries.Keys.OrderBy(f => f));

            // Each CSV has a header plus at least one data row.
            foreach (string file in expectedFiles)
            {
                Assert.True(
                    entries[file].Split('\n', StringSplitOptions.RemoveEmptyEntries).Length > 1,
                    $"{file} had no data rows");
            }
        }

        [Fact]
        public async Task Export_UnknownType_ReturnsBadRequest()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={OrgPartyUuid}&types=foo");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Export_MissingPartyUuid_ReturnsBadRequest()
        {
            HttpResponseMessage response = await _client.GetAsync(BaseUrl);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            string body = await response.Content.ReadAsStringAsync();
            Assert.Contains("partyUuid must be provided.", body);
        }

        [Fact]
        public async Task Export_IncludeSubunits_IncludesSubunitGiverRows()
        {
            HttpResponseMessage withSubunits = await _client.GetAsync($"{BaseUrl}?partyUuid={OrgPartyUuid}&types=instances&includeSubunits=true");
            Assert.Equal(HttpStatusCode.OK, withSubunits.StatusCode);

            string csv = (await ReadZipEntries(withSubunits))[InstanceFile];

            // Subunit iteration: rows from both the main org and its subunit are present.
            Assert.Contains(OrgNumber, csv);
            Assert.Contains(SubunitOrgNumber, csv);
        }

        [Fact]
        public async Task Export_PersonParty_ReturnsBadRequest()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={PersonPartyUuid}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Export_UnknownParty_ReturnsForbidden()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={UnknownPartyUuid}");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task Export_BackendHttpErrorInRoleService_ReturnsBackendStatusWithOrigin()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={BackendErrorPartyUuid}&types=roles");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            string body = await response.Content.ReadAsStringAsync();
            Assert.Contains("Unexpected httpStatus returned from backend (Role)", body);
        }

        [Fact]
        public async Task Export_BackendHttpErrorInAccessPackageService_ReturnsBackendStatusWithOrigin()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={BackendErrorPartyUuid}&types=accesspackages");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            string body = await response.Content.ReadAsStringAsync();
            Assert.Contains("Unexpected httpStatus returned from backend (AccessPackage)", body);
        }

        [Fact]
        public async Task Export_BackendHttpErrorInSingleRightService_ReturnsBackendStatusWithOrigin()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={BackendErrorPartyUuid}&types=singlerights");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            string body = await response.Content.ReadAsStringAsync();
            Assert.Contains("Unexpected httpStatus returned from backend (SingleRights)", body);
        }

        [Fact]
        public async Task Export_BackendHttpErrorInInstanceService_ReturnsBackendStatusWithOrigin()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={BackendErrorPartyUuid}&types=instances");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            string body = await response.Content.ReadAsStringAsync();
            Assert.Contains("Unexpected httpStatus returned from backend (Instances)", body);
        }

        [Fact]
        public async Task Export_ConcurrentRequestBySameUser_ReturnsTooManyRequests()
        {
            // Simulate an already-active export by the same user (userId=1234) via the static dictionary.
var field = typeof(DelegationExportController)
    .GetField("_activeExports", BindingFlags.NonPublic | BindingFlags.Static);
Assert.NotNull(field);

var activeExports = (ConcurrentDictionary<int, byte>)field.GetValue(null)!;
activeExports.TryAdd(1234, 0);

            try
            {
                HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}?partyUuid={OrgPartyUuid}&types=roles");

                Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
                string body = await response.Content.ReadAsStringAsync();
                Assert.Contains("An export is already in progress", body);
            }
            finally
            {
                activeExports.TryRemove(1234, out _);
            }
        }

        private static async Task<Dictionary<string, string>> ReadZipEntries(HttpResponseMessage response)
        {
            byte[] bytes = await response.Content.ReadAsByteArrayAsync();
            var result = new Dictionary<string, string>();

            using var archive = new ZipArchive(new MemoryStream(bytes), ZipArchiveMode.Read);
            foreach (ZipArchiveEntry entry in archive.Entries)
            {
                using var reader = new StreamReader(entry.Open());
                result[entry.FullName] = await reader.ReadToEndAsync();
            }

            return result;
        }
    }
}
