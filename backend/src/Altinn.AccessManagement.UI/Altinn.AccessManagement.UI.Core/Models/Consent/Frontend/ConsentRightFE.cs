namespace Altinn.AccessManagement.UI.Core.Models.Consent.Frontend
{
    /// <summary>
    /// Consent rights where metadata values are replaced
    /// </summary>
    public class ConsentRightFE
    {
        /// <summary>
        /// Resource title
        /// </summary>
        public required Dictionary<string, string> Title { get; set; }

        /// <summary>
        /// Resource consentText with metadata values replaced
        /// </summary>
        public required Dictionary<string, string> ConsentTextHtml { get; set; }
    }
}