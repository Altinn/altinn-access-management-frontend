using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

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
        ///    Fetches all actions on a given resource with details on whether they can be delegated on behalf of the party
        /// </summary>
        /// <param name="from">The party from which the delegation would be on behalf of</param>
        /// <param name="resource">The id of the resource to be checked for delegation</param>
        Task<List<ResourceAction>> DelegationCheck(Guid from, string resource);

        /// <summary>
        ///    Delegates the specified rights on a specified resource to someone on behalf of a specified party
        /// </summary>
        /// <param name="party">The party that is performing the delegation</param>
        /// <param name="from">The party on which the delegation would be on behalf of</param>
        /// <param name="to">The one that will receive access to the resource</param>
        /// <param name="resource">The id of the resource to be delegated</param>
        /// <param name="actionKeys">List of keys for the specific rights/actions that are to be delegated on the resource</param>
        /// <returns> The Http response from backend </returns>
        Task<HttpResponseMessage> Delegate(Guid party, Guid from, Guid to, string resource, List<string> actionKeys);

        /// <summary>
        ///     Gets the resources (without actions) that have been granted from one party to another
        /// </summary>
        /// <param name="languageCode">
        ///     The language code for the request
        /// </param>
        /// <param name="party">The acting party that is asking to see the resource delegations</param>
        /// <param name="from">The party from which the resources have been delegated</param>
        /// <param name="to">The party that has received the delegations</param>
        /// <returns></returns>
        Task<List<ResourceDelegation>> GetDelegatedResources(string languageCode, Guid party, Guid from, Guid to);

        /// <summary>
        ///     Gets the resources (without actions) that have been granted from one party to another
        /// </summary>
        /// <param name="languageCode">
        ///     The language code for the request
        /// </param>
        /// <param name="party">The acting party that is asking to see the resource delegations</param>
        /// <param name="from">The party from which the resources have been delegated</param>
        /// <param name="to">The party that has received the delegations</param>
        /// <param name="resource">The identifier of the resource that has been granted access to</param>
        /// <returns></returns>
        Task<ResourceRight> GetDelegatedResourceRights(string languageCode, Guid party, Guid from, Guid to, string resource);

        /// <summary>
        /// Revokes all rights on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="party">The party that is performing the revoking</param>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the HTTP response message.</returns>
        Task<HttpResponseMessage> RevokeResourceAccess(Guid party, Guid from, Guid to, string resourceId);

        /// <summary>
        /// Makes requested changes to the rights on a resource that has been granted from one party to another.
        /// </summary>
        /// <param name="party">The party that is performing the edit</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
        /// <param name="actionKeys">The updated list of actions that the toParty should hold on the resource</param>
        /// <returns>The http response from backend</returns>
        Task<HttpResponseMessage> UpdateResourceAccess(Guid party, Guid to, Guid from, string resourceId, List<string> actionKeys);
    }
}
