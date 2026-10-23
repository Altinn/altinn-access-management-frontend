using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;

namespace Altinn.AccessManagement.UI.Core.Models.ClientDelegation.Frontend
{
    /// <summary>
    /// The authenticated user's clients through one provider, as sent to the frontend
    /// </summary>
    public class MyClientDelegationFE
    {
        /// <summary>
        /// Gets or sets the provider that has delegated client access to the authenticated user
        /// </summary>
        public PartyFE Provider { get; set; }

        /// <summary>
        /// Gets or sets the clients delegated via the provider
        /// </summary>
        public List<ClientDelegationFE> Clients { get; set; } = new();

        /// <summary>
        /// Maps a provider's client delegations from the access management client delegation endpoints
        /// </summary>
        public static MyClientDelegationFE FromMyClientDelegation(MyClientDelegation delegation)
        {
            if (delegation == null)
            {
                return null;
            }

            return new MyClientDelegationFE
            {
                Provider = PartyFE.FromCompactEntity(delegation.Provider),
                Clients = delegation.Clients?.Select(ClientDelegationFE.FromClientDelegation).ToList() ?? new(),
            };
        }
    }
}
