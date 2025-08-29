namespace Altinn.AccessManagement.UI.Core.Models.Consent.Frontend
{
    /// <summary>
    /// Consent model for list of active consents
    /// </summary>
    public class ConsentListItemFE
    {
        /// <summary>
        /// Consent Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// If consent is a power of attourney or a consent
        /// </summary>
        public bool IsPoa { get; set; }

        /// <summary>
        /// Id of party that requested the consent
        /// </summary>
        public string ToPartyId { get; set; }

        /// <summary>
        /// Name of party that requested the consent
        /// </summary>
        public string ToPartyName { get; set; }

        /// <summary>
        /// Id of party that requested the consent
        /// </summary>
        public string FromPartyId { get; set; }

        /// <summary>
        /// Name of party that requested the consent
        /// </summary>
        public string FromPartyName { get; set; }

        /// <summary>
        /// List all events related to consent
        /// </summary>
        public List<ConsentRequestEventDto> ConsentRequestEvents { get; set; } = [];

        /// <summary>
        /// Consent expiration date
        /// </summary>
        public DateTimeOffset ValidTo { get; set; }
    }
}