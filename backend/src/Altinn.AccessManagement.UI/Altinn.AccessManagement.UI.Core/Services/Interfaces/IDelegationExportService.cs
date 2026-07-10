using Altinn.AccessManagement.UI.Core.Models.DelegationExport;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service that produces a downloadable export (zip of CSV files) of the rights
    /// (roles, access packages and single rights) delegated from a virksomhet and its
    /// underenheter to persons and organizations.
    /// </summary>
    public interface IDelegationExportService
    {
        /// <summary>
        /// Builds a zip archive of CSV files describing all rights delegated from the given
        /// reportee (and optionally its underenheter) to persons and organizations.
        /// </summary>
        /// <param name="partyUuid">The reportee (virksomhet) to export for.</param>
        /// <param name="includeSubunits">Whether to include delegations given from the reportee's underenheter.</param>
        /// <param name="types">The set of right types to include (roles, accesspackages, singlerights, instances). Null/empty = all.</param>
        /// <param name="languageCode">Language code for resolved names (defaults to "nb").</param>
        /// <returns>A <see cref="DelegationExportResult"/> with the zip content or a failure status.</returns>
        Task<DelegationExportResult> ExportReporteeDelegations(Guid partyUuid, bool includeSubunits, ISet<string> types, string languageCode);
    }
}
