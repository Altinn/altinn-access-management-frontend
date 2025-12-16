namespace Altinn.AccessManagement.UI.Core.Models.Consent.Frontend
{
    /// <summary>
    /// Consent model for active consents
    /// </summary>
    public class ActiveConsentItemFE
    {
        /// <summary>
        /// Consent Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// If consent can be consented to. True if PortalViewMode is Show and consent is not yet accepted.
        /// </summary>
        public bool IsPendingConsent { get; set; }

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
    }
}