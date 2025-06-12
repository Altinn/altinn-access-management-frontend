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
        /// Id of party that requested the consent
        /// </summary>
        public string ToPartyId { get; set; }

        /// <summary>
        /// Name of party that requested the consent
        /// </summary>
        public string ToPartyName { get; set; }
    }
}