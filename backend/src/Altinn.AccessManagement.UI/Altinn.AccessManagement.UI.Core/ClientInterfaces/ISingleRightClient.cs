using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    ///     Interface for client to make single right requests to access-managment
    /// </summary>
    public interface ISingleRightClient
    {
        /// <summary>
        ///     Checks whether the user can delegate the given right to the given party
        /// </summary>
        /// <param name="partyId">
        ///     Used to identify the party the authenticated user is acting on behalf of.
        /// </param>
        /// <param name="request">
        ///     The delegation access check request object that's going to be consumed by the backend
        /// </param>
        /// <returns>HttpResponseMessage: The response from backend /></returns>
        Task<HttpResponseMessage> CheckDelegationAccess(string partyId, Right request);

        /// <summary>
        ///     Creates a single rights delegation
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
        ///     Clears cashed accesses of the user
        /// </summary>
        /// <param name="party">
        ///     The party from which the rights have been given (delegator)
        /// </param>
        /// <param name="user">
        ///     The uuid identifier of the user (delegation recipient) to clear access cashe on
        ///     Example: 
        ///     {
        ///     "type": "urn:altinn:person:uuid",
        ///     "value": "00000000-0000-0000-0000-000000000000"
        ///     }
        /// </param>
        /// <returns></returns>
        Task<HttpResponseMessage> ClearAccessCasheOnUser(string party, BaseAttribute user);
    }
}
