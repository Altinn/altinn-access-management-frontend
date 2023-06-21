using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate.SingleRightDelegationInputDto;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    ///     Interface for service to do delegations in access-management
    /// </summary>
    public interface IDelegationService
    {
        /// <summary>
        ///     Checks whether the user can delegate the given right to the given party
        /// </summary>
        /// <param name="partyId">
        ///     Used to identify the party the authenticated user is acting on behalf of./param>
        ///     <param name="request">The delegation access check request object that's going to be consumed by the backend</param>
        ///     <returns></returns>
        Task<List<DelegationCapabiltiesResponse>> RequestCanDelegateAccess(string partyId, SingleRightDelegationInputDto request);
    }
}
