using System.Collections.Generic;
using CsvHelper.Configuration;

namespace Altinn.AccessManagement.UI.Core.Models.DelegationExport
{
    /// <summary>
    /// A single row in the roles CSV of the delegated-rights export.
    /// </summary>
    public class RoleExportRow
    {
        /// <summary>Organization number of the giver (the virksomhet/underenhet the role was given from).</summary>
        public string GiverOrgnr { get; set; }

        /// <summary>Name of the giver.</summary>
        public string GiverNavn { get; set; }

        /// <summary>Recipient identifier (orgnr for organizations, masked id from date of birth for persons).</summary>
        public string MottakerId { get; set; }

        /// <summary>Name of the recipient.</summary>
        public string MottakerNavn { get; set; }

        /// <summary>Type of the recipient (e.g. Person, Organization).</summary>
        public string MottakerType { get; set; }

        /// <summary>Display name of the role.</summary>
        public string RolleNavn { get; set; }

        /// <summary>Code of the role.</summary>
        public string RolleCode { get; set; }
    }

    /// <summary>
    /// CsvHelper column mapping for <see cref="RoleExportRow"/>.
    /// </summary>
    public sealed class RoleExportRowMap : ClassMap<RoleExportRow>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RoleExportRowMap"/> class using the default language (Norwegian bokmål).
        /// </summary>
        public RoleExportRowMap() : this(null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleExportRowMap"/> class with the specified language code.
        /// </summary>
        public RoleExportRowMap(string languageCode)
        {
            Dictionary<string, string> n = DelegationExportColumnNames.GetTranslatedColumnNames(languageCode);
            Map(m => m.GiverOrgnr).Index(0).Name(n["giver_orgnr"]);
            Map(m => m.GiverNavn).Index(1).Name(n["giver_navn"]);
            Map(m => m.RolleNavn).Index(2).Name(n["rolle_navn"]);
            Map(m => m.MottakerNavn).Index(3).Name(n["mottaker_navn"]);
            Map(m => m.MottakerId).Index(4).Name(n["mottaker_id"]);
            Map(m => m.MottakerType).Index(5).Name(n["mottaker_type"]);
            Map(m => m.RolleCode).Index(6).Name(n["rolle_code"]);
        }
    }
}
