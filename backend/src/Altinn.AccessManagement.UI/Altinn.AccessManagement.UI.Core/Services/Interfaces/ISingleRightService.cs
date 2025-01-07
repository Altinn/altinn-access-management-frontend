using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.Frontend;

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

        // ----------------------------
        //// New GUI
        // ----------------------------

        /// <summary>
        ///    Fetches all rights on a given resource with details on whether they can be delegated on behalf of the party
        /// </summary>
        /// <param name="party">The party on which the delegation would be on behalf of</param>
        /// <param name="resource">The id of the resource to be checked for delegation</param>
        Task<List<DelegationCheckedRightFE>> DelegationCheck(Guid party, string resource);

        /// <summary>
        ///    Delegates the specified rights on a specified resource to someone on behalf of a specified party
        /// </summary>
        /// <param name="from">The party on which the delegation would be on behalf of</param>
        /// <param name="to">The one that will receive access to the resource</param>
        /// <param name="resource">The id of the resource to be delegated</param>
        /// <param name="rights">List of keys for the specific rights that are to be delegated on the resource</param>
        /// <returns> List of rightkeys, representing failed delegations </returns>
        Task<DelegationOutput> Delegate(Guid from, Guid to, string resource, List<string> rights);

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
        Task<List<ResourceDelegation>> GetSingleRightsForRightholder(string languageCode, string party, string userId);

        /// <summary>
        /// Revokes all rights on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the HTTP response message.</returns>
        Task<HttpResponseMessage> RevokeResourceAccess(Guid from, Guid to, string resourceId);

        /// <summary>
        /// Makes requested changes to the rights on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <param name="rightsUpdate">The changes in right accesses that is to be made</param>
        /// <returns>A list of right keys whose edits failed, if any</returns>
        Task<List<string>> EditResourceAccess(Guid from, Guid to, string resourceId, RightChanges rightsUpdate);
    }
}
