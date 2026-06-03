using System.IO.Compression;
using System.Net;
using System.Net.Http.Headers;
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

        private const string InstanceFile = "enkeltrettigheter-instans.csv";
        private const string SingleRightFile = "enkeltrettigheter.csv";
        private const string BaseUrl = "accessmanagement/api/v1/delegationexport/reportee";

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
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/{OrgPartyUuid}?types=instances&includeSubunits=false");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/zip", response.Content.Headers.ContentType?.MediaType);
            Assert.Contains($"delegerte-rettigheter-{OrgNumber}", response.Content.Headers.ContentDisposition?.FileNameStar ?? response.Content.Headers.ContentDisposition?.FileName ?? string.Empty);

            Dictionary<string, string> entries = await ReadZipEntries(response);

            // Only the requested type is exported.
            Assert.Equal(new[] { InstanceFile }, entries.Keys);
            string csv = entries[InstanceFile];

            // Header present (UTF-8 BOM is allowed before it).
            Assert.Contains("giver_orgnr;giver_navn;mottaker_id;mottaker_navn;mottaker_type;tjeneste_navn;resource_id;instans_id", csv);

            // Data from the instance mock: recipient is a person -> birth date as dd.MM.yyyy (1981-03-20).
            Assert.Contains("20.03.1981", csv);
            Assert.Contains(OrgNumber, csv);

            // includeSubunits=false: no rows from the subunit giver.
            Assert.DoesNotContain(SubunitOrgNumber, csv);
        }

        [Fact]
        public async Task Export_SingleRightsType_ReturnsPopulatedCsv()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/{OrgPartyUuid}?types=singlerights&includeSubunits=false");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            Dictionary<string, string> entries = await ReadZipEntries(response);
            Assert.Equal(new[] { SingleRightFile }, entries.Keys);

            string csv = entries[SingleRightFile];
            Assert.Contains("giver_orgnr;giver_navn;mottaker_id;mottaker_navn;mottaker_type;tjeneste_navn;resource_id", csv);

            // The single-right delegations mock has direct (non-via) permissions to this recipient.
            Assert.Contains("SITRONGUL MEDALJONG", csv);

            // More than just the header row.
            Assert.True(csv.Split('\n', StringSplitOptions.RemoveEmptyEntries).Length > 1);
        }

        [Fact]
        public async Task Export_UnknownType_ReturnsBadRequest()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/{OrgPartyUuid}?types=foo");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Export_IncludeSubunits_IncludesSubunitGiverRows()
        {
            HttpResponseMessage withSubunits = await _client.GetAsync($"{BaseUrl}/{OrgPartyUuid}?types=instances&includeSubunits=true");
            Assert.Equal(HttpStatusCode.OK, withSubunits.StatusCode);

            string csv = (await ReadZipEntries(withSubunits))[InstanceFile];

            // Subunit iteration: rows from both the main org and its subunit are present.
            Assert.Contains(OrgNumber, csv);
            Assert.Contains(SubunitOrgNumber, csv);
        }

        [Fact]
        public async Task Export_PersonParty_ReturnsBadRequest()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/{PersonPartyUuid}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Export_UnknownParty_ReturnsForbidden()
        {
            HttpResponseMessage response = await _client.GetAsync($"{BaseUrl}/{UnknownPartyUuid}");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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
