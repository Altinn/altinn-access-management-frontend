using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    ///     Interface for service to do delegations in access-management
    /// </summary>
    public interface ISingleRightService
    {
        /// <summary>
        ///     Checks whether the user can delegate the given right to the given party
        /// </summary>
        /// <param name="partyId">
        ///     Used to identify the party the authenticated user is acting on behalf of.
        /// </param>
        /// <param name="request">The delegation access check request object that's going to be consumed by the backend</param>
        /// <returns> List<DelegationAccessCheckResponse /></returns>
        Task<HttpResponseMessage> CheckDelegationAccess(string partyId, Right request);

        /// <summary>
        ///     Creates a single right delegation from a given party
        /// </summary>
        /// <param name="party">
        ///     The party from which to delegate the right
        /// </param>
        /// <param name="delegation">
        ///     The delegation to be created
        /// </param>
        /// <returns></returns>
        Task<HttpResponseMessage> CreateDelegation(string party, DelegationInput delegation);

        /// <summary>
        ///     Clears cached acesses of a delegation recipient
        /// </summary>
        /// <param name="party">
        ///     The party from which the rights have been given (delegator)
        /// </param>
        /// <param name="recipient">
        ///     The uuid identifier of the recipient (delegation recipient) to clear access cache on
        /// </param>
        /// <returns></returns>
        Task<HttpResponseMessage> ClearAccessCacheOnRecipient(string party, BaseAttribute recipient);

        /// <summary>
        ///     Gets the single-rights for a given rightholder
        /// </summary>
        /// <param name="languageCode">
        ///     The language code for the request
        /// </param>
        /// <param name="party">
        ///     The party from which the rights have been given (delegator)
        /// </param>
        /// <param name="userId">
        ///     The user id of the rightholder
        /// </param>
        /// <returns></returns>
        Task<List<ServiceResourceFE>> GetSingleRightsForRightholder(string languageCode, string party, string userId);

        /// <summary>
        /// Revokes a single right for a rightholder.
        /// </summary>
        /// <param name="party">The party from which the rights have been given (delegator).</param>
        /// <param name="delegationDTO">The delegation data transfer object containing the details of the revocation.</param>
        /// <param name="delegationType">The type of delegation to be revoked.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the HTTP response message.</returns>
        Task<HttpResponseMessage> RevokeSingleRightForRightholder(string party, RevokeSingleRightDelegationDTO delegationDTO, DelegationType delegationType);
    }
}
