using CsvHelper.Configuration;

namespace Altinn.AccessManagement.UI.Core.Models.DelegationExport
{
    /// <summary>
    /// A single row in the single-rights (resource) CSV of the delegated-rights export.
    /// </summary>
    public class SingleRightExportRow
    {
        /// <summary>Organization number of the giver (the virksomhet/underenhet the right was given from).</summary>
        public string GiverOrgnr { get; set; }

        /// <summary>Name of the giver.</summary>
        public string GiverNavn { get; set; }

        /// <summary>Recipient identifier (orgnr for organizations, masked id from date of birth for persons).</summary>
        public string MottakerId { get; set; }

        /// <summary>Name of the recipient.</summary>
        public string MottakerNavn { get; set; }

        /// <summary>Type of the recipient (e.g. Person, Organization).</summary>
        public string MottakerType { get; set; }

        /// <summary>Display name of the resource/service.</summary>
        public string TjenesteNavn { get; set; }

        /// <summary>The resource identifier.</summary>
        public string ResourceId { get; set; }
    }

    /// <summary>
    /// CsvHelper column mapping for <see cref="SingleRightExportRow"/>.
    /// </summary>
    public sealed class SingleRightExportRowMap : ClassMap<SingleRightExportRow>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SingleRightExportRowMap"/> class.
        /// </summary>
        public SingleRightExportRowMap()
        {
            Map(m => m.GiverOrgnr).Index(0).Name("giver_orgnr");
            Map(m => m.GiverNavn).Index(1).Name("giver_navn");
            Map(m => m.MottakerId).Index(2).Name("mottaker_id");
            Map(m => m.MottakerNavn).Index(3).Name("mottaker_navn");
            Map(m => m.MottakerType).Index(4).Name("mottaker_type");
            Map(m => m.TjenesteNavn).Index(5).Name("tjeneste_navn");
            Map(m => m.ResourceId).Index(6).Name("resource_id");
        }
    }
}
