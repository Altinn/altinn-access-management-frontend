#nullable enable

namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// Describes a concent
    /// </summary>
    public class Consent
    {
        /// <summary>
        /// The unique identifier for the consent.
        /// </summary>
        public required Guid Id { get; set; }

        /// <summary>
        /// The consent party 
        /// </summary>
        public required string From { get; set; }

        /// <summary>
        /// Defines the party requesting consent.
        /// </summary>
        public required string To { get; set; }

        /// <summary>
        /// Defines the party that handles the consent request on behalf of the requesting party.
        /// </summary>
        public string? HandledBy { get; set; }

        /// <summary>
        /// Defines when the consent was given.
        /// </summary>
        public DateTimeOffset Consented { get; set; }

        /// <summary>
        /// Defines how long the concent is valid
        /// </summary>
        public DateTimeOffset ValidTo { get; set; }

        /// <summary>
        /// The consented rights.
        /// </summary>
        public required List<ConsentRight> ConsentRights { get; set; }

        /// <summary>
        /// The request message
        /// </summary>
        public Dictionary<string, string>? RequestMessage { get; set; }

        /// <summary>
        /// The consent template id.
        /// </summary>
        public required string TemplateId { get; set; }

        /// <summary>
        /// The version of the consent template.
        /// </summary>
        public required int TemplateVersion { get; set; }
    }
}