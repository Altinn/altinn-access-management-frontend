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
        private DelegationExportResult()
        {
        }

        /// <summary>The status of the export.</summary>
        public DelegationExportStatus Status { get; private set; }

        /// <summary>The zip file content. Only set when <see cref="Status"/> is <see cref="DelegationExportStatus.Ok"/>.</summary>
        public byte[] Content { get; private set; }

        /// <summary>The suggested download file name. Only set when <see cref="Status"/> is <see cref="DelegationExportStatus.Ok"/>.</summary>
        public string FileName { get; private set; }

        /// <summary>
        /// Creates a successful result.
        /// </summary>
        /// <param name="content">The zip content (required).</param>
        /// <param name="fileName">The suggested file name (required).</param>
        /// <returns>A successful <see cref="DelegationExportResult"/>.</returns>
        public static DelegationExportResult Success(byte[] content, string fileName)
        {
            ArgumentNullException.ThrowIfNull(content);
            ArgumentException.ThrowIfNullOrWhiteSpace(fileName);

            return new DelegationExportResult { Status = DelegationExportStatus.Ok, Content = content, FileName = fileName };
        }

        /// <summary>
        /// Creates a failed result with the given status.
        /// </summary>
        /// <param name="status">The failure status (must not be <see cref="DelegationExportStatus.Ok"/>).</param>
        /// <returns>A failed <see cref="DelegationExportResult"/>.</returns>
        public static DelegationExportResult Fail(DelegationExportStatus status)
        {
            if (status == DelegationExportStatus.Ok)
            {
                throw new ArgumentException("A failed result cannot have status Ok.", nameof(status));
            }

            return new DelegationExportResult { Status = status };
        }
    }
}
