namespace Altinn.AccessManagement.UI.Core.Models.Consent.Frontend
{
    /// <summary>
    /// Consent model for log item
    /// </summary>
    public class ConsentLogItemFE
    {
        /// <summary>
        /// Consent Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// If consent is a power of attorney or a consent
        /// </summary>
        public bool IsPoa { get; set; }

        /// <summary>
        /// Party that requested the consent
        /// </summary>
        public ConsentPartyFE ToParty { get; set; }

        /// <summary>
        /// Party that requested the consent
        /// </summary>
        public ConsentPartyFE FromParty { get; set; }

        /// <summary>
        /// Party that handles the request if consent is handled by different party than From
        /// </summary>
        public ConsentPartyFE HandledByParty { get; set; }

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