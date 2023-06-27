using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess;
using Altinn.AccessManagement.UI.Core.Models.SingleRight.CheckDelegationAccess.CheckDelegationAccessDto;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces.MockClientInterfaces
{
    /// <summary>
    ///     Interface for client to make mock data for single right
    /// </summary>
    public interface ISingleRightMockClient
    {
        /// <summary>
        ///     A method that returns mocked response that checks whether the user can delegate the given right to the given party.
        ///     To be used when backend is down and when backend is under development
        /// </summary>
        /// <param name="partyId"> </param>
        /// Used to identify the party the authenticated user is acting on behalf of./param>
        /// <param name="request">The delegation access check request object that's going to be consumed by the backend</param>
        /// <returns>List<UserDelegationAccessCheckResponse></UserDelegationAccessCheckResponse></returns>
        List<DelegationAccessCheckResponse> UserDelegationAccessCheck(string partyId, CheckDelegationAccessDto request);

        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse /> with only read access
        /// </summary>
        /// <returns>List<DelegationAccessCheckResponse /></returns>
        List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckNoAccesses();

        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse /> with only read access
        /// </summary>
        /// <returns>List<DelegationAccessCheckResponse /></returns>
        List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckOnlyRead();

        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse /> with read and write access
        /// </summary>
        /// <returns></returns>
        List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckReadAndWrite();

        /// <summary>
        ///     Produces a List<DelegationAccessCheckResponse /> with all accesses
        /// </summary>
        /// <returns></returns>
        List<DelegationAccessCheckResponse> ProduceUserDelegationAccessCheckAllAccesses();
    }
}
