using Altinn.AccessManagement.UI.Core.Models.IdPortenAuthorization;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to handle ID-porten authorizations
    /// </summary>
    public interface IIdPortenAuthorizationClient
    {
        /// <summary>
        /// Get ID-porten authorizations
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>ID-porten authorizations</returns>
        Task<IEnumerable<IdPortenAuthorization>> GetIdPortenAuthorizations(CancellationToken cancellationToken);

        /// <summary>
        /// Withdraw an ID-porten authorizations by id
        /// </summary>
        /// <param name="id">The id of the autorization to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        Task<bool> WithdrawIdPortenAuthorization(string id, CancellationToken cancellationToken);
    }
}
