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
    }
}