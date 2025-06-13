namespace Altinn.AccessManagement.UI.Core.Models.Consent.Frontend
{
    /// <summary>
    /// Consent model where metadata values are replaced
    /// </summary>
    public class ConsentFE
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
        public Dictionary<string, string> TitleAccepted { get; set; }

        /// <summary>
        /// Consent intro
        /// </summary>
        public Dictionary<string, string> ServiceIntroAccepted { get; set; }

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
    }
}
