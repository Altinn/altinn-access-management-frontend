namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// Consent context sent when approving consent request
    /// </summary>
    public class ApproveConsentContext
    {
        /// <summary>
        /// The language request was approved in
        /// </summary>
        public required string Language { get; set; }
    }
}