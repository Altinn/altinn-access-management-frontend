using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with maskinporten schema delegations API in platform
    /// </summary>
    public interface IMaskinportenSchemaClient
    {
        /// <summary>
        /// Gets the delegations received by the party
        /// </summary>
        /// <returns>list of delegations</returns>
        Task<List<MaskinportenSchemaDelegation>> GetReceivedMaskinportenSchemaDelegations(string party);

        /// <summary>
        /// Gets the delegations offered by the party
        /// </summary>
        /// <returns>list of delegations</returns>
        Task<List<MaskinportenSchemaDelegation>> GetOfferedMaskinportenSchemaDelegations(string party);

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
