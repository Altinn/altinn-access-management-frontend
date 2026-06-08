using System.Collections.Generic;

namespace Altinn.AccessManagement.UI.Core.Models.DelegationExport
{
    /// <summary>
    /// Provides translated CSV column names for all delegation export row types.
    /// </summary>
    internal static class DelegationExportColumnNames
    {
        /// <summary>
        /// Returns a dictionary of logical column key → translated header name for the given language code.
        /// Falls back to Norwegian bokmål for unrecognised or null language codes.
        /// </summary>
        internal static Dictionary<string, string> GetTranslatedColumnNames(string languageCode)
        {
            switch (languageCode?.ToLower())
            {
                case "en":
                    return new Dictionary<string, string>
                    {
                        { "giver_orgnr", "Organization number" },
                        { "giver_navn", "Organization name" },
                        { "mottaker_id", "Birth date/Organization number" },
                        { "mottaker_navn", "Recipient name" },
                        { "mottaker_type", "Recipient type" },
                        { "rolle_navn", "Role name" },
                        { "rolle_code", "Role code" },
                        { "tilgangspakke_navn", "Access package name" },
                        { "tilgangspakke_code", "Access package code" },
                        { "tjeneste_navn", "Service name" },
                        { "resource_id", "Resource ID" },
                        { "instans_id", "Instance ID" },
                    };
                case "nn":
                    return new Dictionary<string, string>
                    {
                        { "giver_orgnr", "Organisasjonsnummer" },
                        { "giver_navn", "Organisasjonsnavn" },
                        { "mottaker_id", "Fødselsdato/Organisasjonsnummer" },
                        { "mottaker_navn", "Mottakernavn" },
                        { "mottaker_type", "Mottakertype" },
                        { "rolle_navn", "Rollenavn" },
                        { "rolle_code", "Rollekode" },
                        { "tilgangspakke_navn", "Tilgangspakkenavn" },
                        { "tilgangspakke_code", "Tilgangspakkekode" },
                        { "tjeneste_navn", "Tenestenavn" },
                        { "resource_id", "Ressurs-ID" },
                        { "instans_id", "Instans-ID" },
                    };
                default:
                    return new Dictionary<string, string>
                    {
                        { "giver_orgnr", "Organisasjonsnummer" },
                        { "giver_navn", "Organisasjonsnavn" },
                        { "mottaker_id", "Fødselsdato/Organisasjonsnummer" },
                        { "mottaker_navn", "Mottakernavn" },
                        { "mottaker_type", "Mottakertype" },
                        { "rolle_navn", "Rollenavn" },
                        { "rolle_code", "Rollekode" },
                        { "tilgangspakke_navn", "Tilgangspakkenavn" },
                        { "tilgangspakke_code", "Tilgangspakkekode" },
                        { "tjeneste_navn", "Tjenestenavn" },
                        { "resource_id", "Ressurs-ID" },
                        { "instans_id", "Instans-ID" },
                    };
            }
        }
    }
}
