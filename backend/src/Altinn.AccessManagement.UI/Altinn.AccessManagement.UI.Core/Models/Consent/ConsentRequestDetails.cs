#nullable enable

namespace Altinn.AccessManagement.UI.Core.Models.Consent
{
    /// <summary>
    /// Represents a consent request.
    /// </summary>
    public class ConsentRequestDetails
    {
        /// <summary>
        /// Defines the ID for the consent request.Created by Altinn
        /// </summary>
        public required Guid Id { get; set; }

        /// <summary>
        /// Defines the party that has to consent to the consentRequest
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
        /// Defines how long the consent is valid
        /// </summary>
        public required DateTimeOffset ValidTo { get; set; }

        /// <summary>
        /// The consented rights.
        /// </summary>
        public required List<ConsentRight> ConsentRights { get; set; }

        /// <summary>
        /// The request message
        /// </summary>
        public Dictionary<string, string>? Requestmessage { get; set; }

        /// <summary>
        /// Redirect url for the user to be redirected after consent is given or denied.
        /// </summary>
        public required string RedirectUrl { get; set; }

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