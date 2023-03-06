using Altinn.AccessManagement.UI.Core.Models;
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

        /// <summary>
        /// Revokes received delegation
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation);

        /// <summary>
        /// Revokes Offered delegation
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation);

        /// <summary>
        /// Creates a maskinporten delegation
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation);
    }
}
