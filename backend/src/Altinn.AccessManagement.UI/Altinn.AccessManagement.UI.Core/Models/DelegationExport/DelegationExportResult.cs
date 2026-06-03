namespace Altinn.AccessManagement.UI.Core.Models.DelegationExport
{
    /// <summary>
    /// Outcome of a delegated-rights export request.
    /// </summary>
    public enum DelegationExportStatus
    {
        /// <summary>Export produced successfully.</summary>
        Ok,

        /// <summary>The requested party was not found in the authenticated user's reportee list.</summary>
        PartyNotFound,

        /// <summary>The requested party is not an organization; the export is only available for virksomheter.</summary>
        NotOrganization,
    }

    /// <summary>
    /// The result of building a delegated-rights export, including a status used by the controller
    /// to choose the HTTP response.
    /// </summary>
    public class DelegationExportResult
    {
        /// <summary>The status of the export.</summary>
        public DelegationExportStatus Status { get; set; }

        /// <summary>The zip file content. Only set when <see cref="Status"/> is <see cref="DelegationExportStatus.Ok"/>.</summary>
        public byte[] Content { get; set; }

        /// <summary>The suggested download file name. Only set when <see cref="Status"/> is <see cref="DelegationExportStatus.Ok"/>.</summary>
        public string FileName { get; set; }

        /// <summary>
        /// Creates a successful result.
        /// </summary>
        /// <param name="content">The zip content.</param>
        /// <param name="fileName">The suggested file name.</param>
        /// <returns>A successful <see cref="DelegationExportResult"/>.</returns>
        public static DelegationExportResult Success(byte[] content, string fileName) =>
            new DelegationExportResult { Status = DelegationExportStatus.Ok, Content = content, FileName = fileName };

        /// <summary>
        /// Creates a failed result with the given status.
        /// </summary>
        /// <param name="status">The failure status.</param>
        /// <returns>A failed <see cref="DelegationExportResult"/>.</returns>
        public static DelegationExportResult Fail(DelegationExportStatus status) =>
            new DelegationExportResult { Status = status };
    }
}
