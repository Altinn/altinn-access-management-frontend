using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Delegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    ///     Service interface for service handling maskinporten schema delegations
    /// </summary>
    public interface IAPIDelegationService
    {
        /// <summary>
        /// Gets all the resources delegated by the reportee
        /// </summary>
        /// <param name="party">reportee that delegated resources</param>
        /// <param name="languageCode">language to use for resource metadata</param>
        /// <returns>list of delgations</returns>
        public Task<List<OverviewOrg>> GetOfferedMaskinportenSchemaDelegations(string party, string languageCode);

        /// <summary>
        /// Gets all the delegations received by a reportee
        /// </summary>
        /// <param name="party">reportee that received resources</param>
        /// <param name="languageCode">language to use for resource metadata</param>
        /// <returns>list of delgations</returns>
        public Task<List<OverviewOrg>> GetReceivedMaskinportenSchemaDelegations(string party, string languageCode);

        /// <summary>
        /// Revokes a delegation received by the party
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegationDTO">delegation to be revoked</param>
        /// <returns></returns>
        public Task<HttpResponseMessage> RevokeReceivedMaskinportenScopeDelegation(string party, RevokeDelegationDTO delegationDTO);

        /// <summary>
        /// Revokes a delegation offered by the party
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegationDTO">delegation to be revoked</param>
        /// <returns></returns>
        public Task<HttpResponseMessage> RevokeOfferedMaskinportenScopeDelegation(string party, RevokeDelegationDTO delegationDTO);
        
        /// <summary>
        /// Revokes a one or more delegation offered or received by the party
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegationDTOs">List of delegations to be revoked</param>
        /// <param name="layout">the layout state</param>
        /// <returns></returns>
        public Task<List<RevokeApiDelegationOutput>> BatchRevokeMaskinportenScopeDelegation(string party, List<RevokeDelegationDTO> delegationDTOs, LayoutState layout);

        /// <summary>
        /// Creates a maskinporten delegation from the party to a third party organization
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be performed</param>
        /// <returns></returns>
        public Task<HttpResponseMessage> CreateMaskinportenScopeDelegation(string party, DelegationInput delegation);

        /// <summary>
        /// Delegates maskinporten scope to organizations, on behalf of a sinlge party. This endpoint enables both single delegations and batches of one or more maskinporten scopes to one or more organizations
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be performed</param>
        /// <returns></returns>
        public Task<List<ApiDelegationOutput>> BatchCreateMaskinportenScopeDelegation(string party, ApiDelegationInput delegation);

        /// <summary>
        /// Endpoint for performing a check if the user can delegate a maskinporten schema service to a specified reportee.
        /// </summary>
        /// <param name="partyId">The reportee's party id</param>
        /// <param name="request">Necessary info about the right that's going to be checked</param>
        public Task<List<DelegationResponseData>> DelegationCheck(string partyId, Right request);
    }
}
