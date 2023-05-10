using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service interface for service handling maskinporten schema delegations
    /// </summary>
    public interface IMaskinportenSchemaService
    {
        /// <summary>
        /// Gets all the resources delegated by the reportee
        /// </summary>
        /// <param name="party">reportee that delegated resources</param>
        /// <param name="languageCode">language to use for resource metadata</param>
        /// <returns>list of delgations</returns>
        public Task<List<MaskinportenSchemaDelegationFE>> GetOfferedMaskinportenSchemaDelegations(string party, string languageCode);

        /// <summary>
        /// Gets all the delegations received by a reportee
        /// </summary>
        /// <param name="party">reportee that received resources</param>
        /// <param name="languageCode">language to use for resource metadata</param>
        /// <returns>list of delgations</returns>
        public Task<List<MaskinportenSchemaDelegationFE>> GetReceivedMaskinportenSchemaDelegations(string party, string languageCode);

        /// <summary>
        /// Revokes a delegation received by the party
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        public Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeReceivedDelegation delegation);

        /// <summary>
        /// Revokes a delegation offered by the party
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        public Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeOfferedDelegation delegation);

        /// <summary>
        /// Creates a maskinporten delegation from the party to a third party organization
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be performed</param>
        /// <returns></returns>
        public Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation);
    }
}
