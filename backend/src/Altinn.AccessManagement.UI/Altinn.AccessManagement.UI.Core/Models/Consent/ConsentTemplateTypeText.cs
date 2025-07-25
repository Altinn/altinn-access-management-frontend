namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// Defines texts used in consent templates
    /// </summary>
    public class ConsentTemplateTypeText
    {
        /// <summary>
        /// Texts used in consent for organization
        /// </summary>
        public Dictionary<string, string> Org { get; set; }

        /// <summary>
        /// Texts used in consent for person
        /// </summary>
        public Dictionary<string, string> Person { get; set; }
    }
}