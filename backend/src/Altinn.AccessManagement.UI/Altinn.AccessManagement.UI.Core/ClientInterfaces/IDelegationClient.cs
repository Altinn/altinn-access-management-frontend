using Altinn.AccessManagement.UI.Core.Models.Delegation.SingleRight.CanDelegate;
namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    ///     Interface for client to do delegations in access-managment
    /// </summary>
    public interface IDelegationClient
    {
        /// <summary>
        ///     Checks whether the user can delegate the given right to the given party
        /// </summary>
        /// <param name="party">party</param>
        /// <param name="delegation">delegation to be revoked</param>
        /// <returns></returns>
        Task<bool> UserDelegationCheck(string party, SingleRightDelegationInputDto request);
    }
}
