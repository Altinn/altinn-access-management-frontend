using System.IO.Compression;
using System.Text;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.DelegationExport;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    /// <summary>
    /// Tests for <see cref="DelegationExportCsvBuilder"/> covering escaping, CSV/formula-injection
    /// protection, UTF-8 BOM and zip packaging.
    /// </summary>
    public class DelegationExportCsvBuilderTest
    {
        [Fact]
        public void WriteCsv_StartsWithUtf8Bom()
        {
            byte[] bytes = DelegationExportCsvBuilder.WriteCsv<RoleExportRow, RoleExportRowMap>(new List<RoleExportRow>());

            Assert.True(bytes.Length >= 3);
            Assert.Equal(0xEF, bytes[0]);
            Assert.Equal(0xBB, bytes[1]);
            Assert.Equal(0xBF, bytes[2]);
        }

        [Fact]
        public void WriteCsv_EmptyRows_WritesHeaderOnly()
        {
            string content = Decode(DelegationExportCsvBuilder.WriteCsv<RoleExportRow, RoleExportRowMap>(new List<RoleExportRow>()));

            Assert.Contains("Organisasjonsnummer;Organisasjonsnavn;Rollenavn;Mottakernavn;Fødselsdato/Organisasjonsnummer;Mottakertype;Rollekode", content);
            // Only the header line (plus trailing newline) should be present.
            Assert.Single(content.Split('\n', StringSplitOptions.RemoveEmptyEntries));
        }

        [Fact]
        public void WriteCsv_ValueWithDelimiterQuoteAndNewline_IsRfc4180Quoted()
        {
            var rows = new List<RoleExportRow>
            {
                new RoleExportRow { GiverNavn = "Name; with \"quote\"\nand newline", RolleCode = "x" },
            };

            string content = Decode(DelegationExportCsvBuilder.WriteCsv<RoleExportRow, RoleExportRowMap>(rows));

            // Field is wrapped in quotes and the embedded double-quote is doubled.
            Assert.Contains("\"Name; with \"\"quote\"\"\nand newline\"", content);
        }

        [Theory]
        [InlineData("=SUM(A1)")]
        [InlineData("+1+1")]
        [InlineData("-2+3")]
        [InlineData("@cmd")]
        public void WriteCsv_FormulaInjection_IsNeutralized(string dangerous)
        {
            var rows = new List<RoleExportRow>
            {
                new RoleExportRow { RolleNavn = dangerous },
            };

            string content = Decode(DelegationExportCsvBuilder.WriteCsv<RoleExportRow, RoleExportRowMap>(rows));

            // The dangerous value must not appear as a raw field starting with the trigger char;
            // CsvHelper prefixes it with the injection-escape character (apostrophe).
            Assert.Contains("'" + dangerous, content);
            Assert.DoesNotContain(";" + dangerous, content);
        }

        [Fact]
        public void BuildZip_ContainsAllEntriesWithRoundtrippedContent()
        {
            var files = new Dictionary<string, byte[]>
            {
                ["roller.csv"] = Encoding.UTF8.GetBytes("a;b"),
                ["tilgangspakker.csv"] = Encoding.UTF8.GetBytes("c;d"),
            };

            byte[] zip = DelegationExportCsvBuilder.BuildZip(files);

            using var archive = new ZipArchive(new MemoryStream(zip), ZipArchiveMode.Read);
            Assert.Equal(2, archive.Entries.Count);

            foreach (KeyValuePair<string, byte[]> file in files)
            {
                ZipArchiveEntry entry = archive.GetEntry(file.Key);
                Assert.NotNull(entry);

                using var reader = new StreamReader(entry.Open());
                Assert.Equal(Encoding.UTF8.GetString(file.Value), reader.ReadToEnd());
            }
        }

        private static string Decode(byte[] bytes) => new UTF8Encoding(true).GetString(bytes);
    }
}
