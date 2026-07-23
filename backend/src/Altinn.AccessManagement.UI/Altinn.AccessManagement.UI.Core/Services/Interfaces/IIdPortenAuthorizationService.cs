using Altinn.AccessManagement.UI.Core.Models.IdPortenAuthorization;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for service to handle ID-porten authorizations
    /// </summary>
    public interface IIdPortenAuthorizationService
    {
        /// <summary>
        /// Get ID-porten authorizations for logged in user
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>ID-porten authorizations</returns>
        Task<IEnumerable<IdPortenAuthorizationFE>> GetIdPortenAuthorizations(CancellationToken cancellationToken);

        /// <summary>
        /// Withdraw an ID-porten authorizations by id
        /// </summary>
        /// <param name="id">The id of the autorization to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        Task<bool> WithdrawIdPortenAuthorization(string id, CancellationToken cancellationToken);
    }
}
