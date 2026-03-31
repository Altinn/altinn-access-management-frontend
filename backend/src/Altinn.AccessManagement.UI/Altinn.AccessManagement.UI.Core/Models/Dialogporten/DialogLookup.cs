namespace Altinn.AccessManagement.UI.Core.Models.Dialogporten
{
    /// <summary>
    /// Dialogporten lookup result for an instance reference.
    /// </summary>
    public class DialogLookup
    {
        /// <summary>
        /// Gets or sets the dialog identifier.
        /// </summary>
        public Guid DialogId { get; set; }

        /// <summary>
        /// Gets or sets the instance reference.
        /// </summary>
        public string InstanceRef { get; set; }

        /// <summary>
        /// Gets or sets localized title values.
        /// </summary>
        public List<DialogLookupLocalization> Title { get; set; }
    }

    /// <summary>
    /// Localized value from dialogporten.
    /// </summary>
    public class DialogLookupLocalization
    {
        /// <summary>
        /// Gets or sets the localized value.
        /// </summary>
        public string Value { get; set; }

        /// <summary>
        /// Gets or sets the language code.
        /// </summary>
        public string LanguageCode { get; set; }
    }
}
