using Altinn.Register.Contracts.V1;

namespace Altinn.AccessManagement.UI.Core.Models.Consent.Frontend
{
    /// <summary>
    /// Consent model party
    /// </summary>
    public class ConsentPartyFE
    {
        /// <summary>
        /// Consent party Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Consent party Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Consent party Type, Person or Organization
        /// </summary>
        public PartyType Type { get; set; }
    }
}