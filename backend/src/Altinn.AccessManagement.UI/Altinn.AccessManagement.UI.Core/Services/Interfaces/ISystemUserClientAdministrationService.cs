using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// The "middleware" between the BFF's SystemUserAPI and Altinn's real SystemUserAPI in the Authentication Component
    /// </summary>
    public interface ISystemUserClientAdministrationService
    {
        /// <summary>
        /// Return all regnskapsfører customers for a party
        /// </summary>
        /// <param name="partyUuid">The party UUID of the party to retrieve customers from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all party customers</returns>
        Task<Result<List<ClientPartyFE>>> GetPartyRegnskapsforerCustomers(Guid partyUuid, CancellationToken cancellationToken);

        /// <summary>
        /// Return all revisor customers for a party
        /// </summary>
        /// <param name="partyUuid">The party UUID of the party to retrieve customers from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of all party customers</returns>
        Task<Result<List<ClientPartyFE>>> GetPartyRevisorCustomers(Guid partyUuid, CancellationToken cancellationToken);

        /// <summary>
        /// Return delegated customers for this system user
        /// </summary>
        /// <param name="partyId">The party UUID of the party to retrieve retrieve delegated customers from</param>
        /// <param name="systemUserGuid">The party UUID of the party to retrieve delegated customers from</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of delegated customers for system user</returns>
        Task<Result<List<string>>> GetSystemUserClientDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken);

        Task<Result<bool>> AddClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken);

        Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken);
    }
}