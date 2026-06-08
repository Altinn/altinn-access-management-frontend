using System.Globalization;
using System.IO.Compression;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Builds a zip archive of CSV files for the delegated-rights export.
    /// Uses CsvHelper for RFC 4180 quoting and CSV/formula-injection protection,
    /// and the built-in <see cref="ZipArchive"/> for packaging.
    /// </summary>
    public static class DelegationExportCsvBuilder
    {
        // UTF-8 WITH BOM so Excel on Windows renders æ/ø/å correctly for ';'-separated files.
        private static readonly Encoding Utf8WithBom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);

        // Neutralize values that start with =, +, -, @, TAB or CR so spreadsheet apps
        // do not interpret externally supplied names as formulas.
        private static CsvConfiguration CreateConfig() => new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = ";",
            InjectionOptions = InjectionOptions.Escape,
            HasHeaderRecord = true,
        };

        /// <summary>
        /// Serializes a set of typed rows to a single CSV file (as bytes), with the given class map.
        /// The header is always written, even when <paramref name="rows"/> is empty.
        /// </summary>
        /// <typeparam name="TRow">The row type.</typeparam>
        /// <typeparam name="TMap">The CsvHelper class map for <typeparamref name="TRow"/>.</typeparam>
        /// <param name="rows">The rows to write.</param>
        /// <returns>The CSV content as UTF-8 (with BOM) bytes.</returns>
        public static byte[] WriteCsv<TRow, TMap>(IEnumerable<TRow> rows)
            where TMap : ClassMap<TRow>, new()
        {
            return WriteCsv(rows, new TMap());
        }

        /// <summary>
        /// Serializes a set of typed rows to a single CSV file (as bytes), with a pre-constructed class map instance.
        /// Use this overload when the map requires constructor arguments (e.g. a language code).
        /// </summary>
        /// <typeparam name="TRow">The row type.</typeparam>
        /// <param name="rows">The rows to write.</param>
        /// <param name="map">The CsvHelper class map instance to use.</param>
        /// <returns>The CSV content as UTF-8 (with BOM) bytes.</returns>
        public static byte[] WriteCsv<TRow>(IEnumerable<TRow> rows, ClassMap<TRow> map)
        {
            using var memory = new MemoryStream();
            using (var writer = new StreamWriter(memory, Utf8WithBom))
            using (var csv = new CsvWriter(writer, CreateConfig()))
            {
                csv.Context.RegisterClassMap(map);
                csv.WriteHeader<TRow>();
                csv.NextRecord();

                foreach (TRow row in rows ?? Enumerable.Empty<TRow>())
                {
                    csv.WriteRecord(row);
                    csv.NextRecord();
                }
            }

            return memory.ToArray();
        }

        /// <summary>
        /// Packs the given named CSV byte-payloads into a single zip archive.
        /// </summary>
        /// <param name="files">A mapping of file name (e.g. "roller.csv") to its CSV bytes.</param>
        /// <returns>The zip archive as bytes.</returns>
        public static byte[] BuildZip(IReadOnlyDictionary<string, byte[]> files)
        {
            using var memory = new MemoryStream();
            using (var archive = new ZipArchive(memory, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (KeyValuePair<string, byte[]> file in files)
                {
                    ZipArchiveEntry entry = archive.CreateEntry(file.Key, CompressionLevel.Optimal);
                    using Stream entryStream = entry.Open();
                    entryStream.Write(file.Value, 0, file.Value.Length);
                }
            }

            return memory.ToArray();
        }
    }
}
