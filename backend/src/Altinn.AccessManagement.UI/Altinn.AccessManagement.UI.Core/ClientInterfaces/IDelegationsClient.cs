using Altinn.AccessManagement.UI.Core.Models.Delegation;
using Altinn.Platform.Profile.Models;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for delgation client to integrate with delegations API in platform
    /// </summary>
    public interface IDelegationsClient
    {
        /// <summary>
        /// Gets the delegations received by the party
        /// </summary>
        /// <returns>list of delegations</returns>
        Task<List<Delegation>> GetInboundDelegations(string party);

        /// <summary>
        /// Gets the delegations given by the party
        /// </summary>
        /// <returns>list of delegations</returns>
        Task<List<Delegation>> GetOutboundDelegations(string party);
    }
}
