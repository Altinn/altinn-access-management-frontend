using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Enums
{
    /// <summary>
    /// Defines the different registry roles a right holder can have
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum RegistryRoleType
    {
        /// <summary>
        /// Daglig leder
        /// </summary>
        [EnumMember(Value = "DAGL")]
        DAGL = 0,

        /// <summary>
        /// Styrets leder
        /// </summary>
        [EnumMember(Value = "LEDE")]
        LEDE = 1,

        /// <summary>
        /// Regnskapsfører
        /// </summary>
        [EnumMember(Value = "REGN")]
        REGN = 2,

        /// <summary>
        /// Revisor registrert i revisorregisteret
        /// </summary>
        [EnumMember(Value = "SREVA")]
        SREVA = 3,

        /// <summary>
        /// Inngår i føretaksgruppe
        /// </summary>
        [EnumMember(Value = "FGRP")]
        FGRP = 4,

        /// <summary>
        /// Hovedforetak
        /// </summary>
        [EnumMember(Value = "HFOR")]
        HFOR = 5,

        /// <summary>
        /// Helseforetak
        /// </summary>
        [EnumMember(Value = "HLSE")]
        HLSE = 6,

        /// <summary>
        /// Innehaver
        /// </summary>
        [EnumMember(Value = "INNH")]
        INNH = 7,

        /// <summary>
        /// Has as subsidiary in the group
        /// </summary>
        [EnumMember(Value = "KDAT")]
        KDAT = 8,

        /// <summary>
        /// Har som grunnlag for konsern
        /// </summary>
        [EnumMember(Value = "KGRL")]
        KGRL = 9,

        /// <summary>
        /// Inngår i kirkelig fellesråd
        /// </summary>
        [EnumMember(Value = "KIRK")]
        KIRK = 10,

        /// <summary>
        /// Har som mor i konsern
        /// </summary>
        [EnumMember(Value = "KMOR")]
        KMOR = 11,

        /// <summary>
        /// Komplementar
        /// </summary>
        [EnumMember(Value = "KOMP")]
        KOMP = 12,

        /// <summary>
        /// Kontaktperson
        /// </summary>
        [EnumMember(Value = "KONT")]
        KONT = 13,

        /// <summary>
        /// Inngår i kontorfellesskap
        /// </summary>
        [EnumMember(Value = "KTRF")]
        KTRF = 14,

        /// <summary>
        /// Styremedlem
        /// </summary>
        [EnumMember(Value = "MEDL")]
        MEDL = 15,

        /// <summary>
        /// Nestleder
        /// </summary>
        [EnumMember(Value = "NEST")]
        NEST = 16,

        /// <summary>
        /// Observatør
        /// </summary>
        [EnumMember(Value = "OBS")]
        OBS = 17,

        /// <summary>
        /// Er særskilt oppdelt enhet til
        /// </summary>
        [EnumMember(Value = "OPMV")]
        OPMV = 18,

        /// <summary>
        /// Organisasjonsledd i offentlig sektor
        /// </summary>
        [EnumMember(Value = "ORGL")]
        ORGL = 19,

        /// <summary>
        /// Prokura i fellesskap
        /// </summary>
        [EnumMember(Value = "POFE")]
        POFE = 20,

        /// <summary>
        /// Prokura hver for seg
        /// </summary>
        [EnumMember(Value = "POHV")]
        POHV = 21,

        /// <summary>
        /// Prokura
        /// </summary>
        [EnumMember(Value = "PROK")]
        PROK = 22,

        /// <summary>
        /// Er revisoradresse for
        /// </summary>
        [EnumMember(Value = "READ")]
        READ = 23,

        /// <summary>
        /// Har som registreringsenhet
        /// </summary>
        [EnumMember(Value = "AAFY")]
        AAFY = 24,

        /// <summary>
        /// Forestår avvikling
        /// </summary>
        [EnumMember(Value = "AVKL")]
        AVKL = 25,

        /// <summary>
        /// Har som registreringsenhet
        /// </summary>
        [EnumMember(Value = "BEDR")]
        BEDR = 26,

        /// <summary>
        /// Deltaker med delt ansvar
        /// </summary>
        [EnumMember(Value = "DTPR")]
        DTPR = 27,

        /// <summary>
        /// Deltaker med fullt ansvar
        /// </summary>
        [EnumMember(Value = "DTSO")]
        DTSO = 28,

        /// <summary>
        /// Eierkommune
        /// </summary>
        [EnumMember(Value = "EIKM")]
        EIKM = 29,

        /// <summary>
        /// Inngår i felles- registrering
        /// </summary>
        [EnumMember(Value = "FEMV")]
        FEMV = 30,

        /// <summary>
        /// Er regnskapsføreradresse for
        /// </summary>
        [EnumMember(Value = "RFAD")]
        RFAD = 31,

        /// <summary>
        /// Sameiere
        /// </summary>
        [EnumMember(Value = "SAM")]
        SAM = 31,

        /// <summary>
        /// Signatur i fellesskap
        /// </summary>
        [EnumMember(Value = "SIFE")]
        SIFE = 32,

        /// <summary>
        /// Signatur
        /// </summary>
        [EnumMember(Value = "SIGN")]
        SIGN = 33,

        /// <summary>
        /// Signatur hver for seg
        /// </summary>
        [EnumMember(Value = "SIHV")]
        SIHV = 34,

        /// <summary>
        /// Er frivillig registrert utleiebygg for
        /// </summary>
        [EnumMember(Value = "UTBG")]
        UTBG = 35,

        /// <summary>
        /// Varamedlem
        /// </summary>
        [EnumMember(Value = "VARA")]
        VARA = 36,

        /// <summary>
        /// Er virksomhet drevet i fellesskap av
        /// </summary>
        [EnumMember(Value = "VIFE")]
        VIFE = 37,

        /// <summary>
        /// Utfyller MVA-oppgaver
        /// </summary>
        [EnumMember(Value = "MVAU")]
        MVAU = 38,

        /// <summary>
        /// Signerer MVA-oppgaver
        /// </summary>
        [EnumMember(Value = "MVAG")]
        MVAG = 39,

        /// <summary>
        /// Kontaktperson i kommune
        /// </summary>
        [EnumMember(Value = "KOMK")]
        KOMK = 40,

        /// <summary>
        /// Kontaktperson for NUF
        /// </summary>
        [EnumMember(Value = "KNUF")]
        KNUF = 41,

        /// <summary>
        /// Kontaktperson i Adm. enhet - offentlig sektor
        /// </summary>
        [EnumMember(Value = "KEMN")]
        KEMN = 42,

        /// <summary>
        /// Forretningsfører
        /// </summary>
        [EnumMember(Value = "FFØR")]
        FFØR = 43,

        /// <summary>
        /// Bestyrende reder
        /// </summary>
        [EnumMember(Value = "BEST")]
        BEST = 44,

        /// <summary>
        /// Norsk representant for utenlandsk enhet
        /// </summary>
        [EnumMember(Value = "REPR")]
        REPR = 45,

        /// <summary>
        /// Revisor
        /// </summary>
        [EnumMember(Value = "REVI")]
        REVI = 46,

        /// <summary>
        /// Bostyrer
        /// </summary>
        [EnumMember(Value = "BOBE")]
        BOBE = 47,

        /// <summary>
        /// Stifter
        /// </summary>
        [EnumMember(Value = "STFT")]
        STFT = 48,

        /// <summary>
        /// Den personlige konkursen angår
        /// </summary>
        [EnumMember(Value = "KENK")]
        KENK = 49,

        /// <summary>
        /// Konkursdebitor
        /// </summary>
        [EnumMember(Value = "KDEB")]
        KDEB = 50,

        /// <summary>
        /// Varamedlem i partiets utøvende organ
        /// </summary>
        [EnumMember(Value = "HVAR")]
        HVAR = 51,

        /// <summary>
        /// Nestleder i partiets utøvende organ
        /// </summary>
        [EnumMember(Value = "HNST")]
        HNST = 52,

        /// <summary>
        /// Styremedlem i partiets utøvende organ
        /// </summary>
        [EnumMember(Value = "HMDL")]
        HMDL = 53,

        /// <summary>
        /// Leder i partiets utøvende organ
        /// </summary>
        [EnumMember(Value = "HLED")]
        HLED = 54,

        /// <summary>
        /// Elektronisk signeringsrett
        /// </summary>
        [EnumMember(Value = "ESGR")]
        ESGR = 55,

        /// <summary>
        /// Skal fusjoneres med
        /// </summary>
        [EnumMember(Value = "FUSJ")]
        FUSJ = 56,

        /// <summary>
        /// Skal fisjoneres med
        /// </summary>
        [EnumMember(Value = "FISJ")]
        FISJ = 57,

        /// <summary>
        /// Tildeler av elektronisk signeringsrett
        /// </summary>
        [EnumMember(Value = "ETDL")]
        ETDL = 58,

        /// <summary>
        /// Administrativ enhet - offentlig sektor
        /// </summary>
        [EnumMember(Value = "ADOS")]
        ADOS = 59,
    }
}
