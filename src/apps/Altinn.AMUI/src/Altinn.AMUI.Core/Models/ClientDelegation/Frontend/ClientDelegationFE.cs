using Altinn.AMUI.Core.Models.Common.Frontend;

namespace Altinn.AMUI.Core.Models.ClientDelegation.Frontend
{
    /// <summary>
    /// A client with the access delegated for it, as sent to the frontend
    /// </summary>
    public class ClientDelegationFE
    {
        /// <summary>
        /// Gets or sets the client
        /// </summary>
        public PartyFE Client { get; set; }

        /// <summary>
        /// Gets or sets the access per role
        /// </summary>
        public List<ClientDelegation.RoleAccessPackages> Access { get; set; } = new();

        /// <summary>
        /// Maps a client delegation from the access management client delegation endpoints
        /// </summary>
        public static ClientDelegationFE FromClientDelegation(ClientDelegation delegation)
        {
            if (delegation == null)
            {
                return null;
            }

            return new ClientDelegationFE
            {
                Client = PartyFE.FromEntity(delegation.Client),
                Access = delegation.Access ?? new(),
            };
        }
    }
}
