namespace Altinn.AccessManagement.UI.Core.Models.Consent.Frontend
{
    /// <summary>
    /// Consent request model where metadata values are replaced
    /// </summary>
    public class ConsentRequestFE
    {
        /// <summary>
        /// Consent Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Rights (resources) in consent
        /// </summary>
        public List<ConsentRightFE> Rights { get; set; }

        /// <summary>
        /// If consent is a power of attourney or a consent
        /// </summary>
        public bool IsPoa { get; set; }

        /// <summary>
        /// Consent title
        /// </summary>
        public Dictionary<string, string> Title { get; set; }

        /// <summary>
        /// Consent heading
        /// </summary>
        public Dictionary<string, string> Heading { get; set; }

        /// <summary>
        /// Consent intro
        /// </summary>
        public Dictionary<string, string> ServiceIntro { get; set; }

        /// <summary>
        /// Consent message from request, or OverriddenDelegationContext from template
        /// </summary>
        public Dictionary<string, string> ConsentMessage { get; set; }

        /// <summary>
        /// Consent handledBy, if consent is handled by different party than From
        /// </summary>
        public Dictionary<string, string> HandledBy { get; set; }

        /// <summary>
        /// Consent expiration text
        /// </summary>
        public Dictionary<string, string> Expiration { get; set; }

        /// <summary>
        /// Party name if request is for an organization
        /// </summary>
        public string FromPartyName { get; set; }

        /// <summary>
        /// Date consentend (or null if not consented yet)
        /// </summary>
        public DateTimeOffset? ConsentedDate { get; set; }
    }
}