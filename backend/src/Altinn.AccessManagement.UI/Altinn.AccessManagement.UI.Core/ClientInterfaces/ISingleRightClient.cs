using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;

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
        ///     Used to identify the party the authenticated user is acting on behalf of./param>
        ///     <param name="request">The delegation access check request object that's going to be consumed by the backend</param>
        ///     <returns></returns>
        Task<List<DelegationAccessCheckResponse>> UserDelegationAccessCheck(string partyId, CheckDelegationAccessDto request);
    }
}