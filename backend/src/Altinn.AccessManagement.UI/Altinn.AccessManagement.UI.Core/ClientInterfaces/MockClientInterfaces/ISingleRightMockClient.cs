using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate.SingleRightDelegationInputDto;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces.MockClientInterfaces
{
    /// <summary>
    ///     Interface for client to make mock data
    public interface ISingleRightMockClient
    {
        /// <summary>
        /// A method that returns mock response that checks whether the user can delegate the given right to the given party.
        /// To be used when backend is down and when backend is under development
        /// </summary>
        /// <param name="partyId">
        /// Used to identify the party the authenticated user is acting on behalf of./param>
        /// <param name="request">The delegation access check request object that's going to be consumed by the backend</param>
        /// <returns>List<UserDelegationAccessCheckResponse></returns>
        List<UserDelegationAccessCheckResponse> UserDelegationAccessCheck(string partyId, CheckDelegationAccessDto request);
    }
}
