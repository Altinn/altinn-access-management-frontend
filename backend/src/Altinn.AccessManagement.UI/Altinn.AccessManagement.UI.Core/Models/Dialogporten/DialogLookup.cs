using System.Text.Json.Serialization;

namespace Altinn.AccessManagement.UI.Core.Models.Dialogporten
{
    /// <summary>
    /// Status of a dialogporten lookup attempt.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum DialogLookupStatus
    {
        /// <summary>Dialog was found and title is available.</summary>
        Success,

        /// <summary>Dialog was not found (404).</summary>
        NotFound,

        /// <summary>The caller does not have access to the dialog content (403).</summary>
        Forbidden,
    }

    /// <summary>
    /// Dialogporten lookup result for an instance reference.
    /// </summary>
    public class DialogLookup
    {
        /// <summary>
        /// Gets or sets the outcome of the lookup.
        /// </summary>
        public DialogLookupStatus Status { get; set; } = DialogLookupStatus.Success;

        /// <summary>
        /// Gets or sets the dialog identifier.
        /// </summary>
        public Guid DialogId { get; set; }

        /// <summary>
        /// Gets or sets the instance reference.
        /// </summary>
        public string InstanceRef { get; set; }

        /// <summary>
        /// Gets or sets localized title values. Only populated when <see cref="Status"/> is <see cref="DialogLookupStatus.Success"/>.
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
