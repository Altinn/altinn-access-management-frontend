using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Request;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to handle requests
    /// </summary>
    public interface IRequestClient
    {
        /// <summary>
        /// Get all requests for a party (as sender or receiver)
        /// </summary>
        /// <param name="party">The party that is performing the edit</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The http response from backend</returns>
        Task<PaginatedResult<RequestResourceDto>> GetSingleRightRequests(Guid party, Guid to, Guid from, List<RequestStatus> status, CancellationToken cancellationToken);

        /// <summary>
        /// Create a new single right request
        /// </summary>
        /// <param name="party">The party that is performing the edit</param>
        /// <param name="payload">The request payload, containing to party, from party and resource</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The http response from backend</returns>
        Task<bool> CreateSingleRightRequest(Guid party, CreateRequestInput payload, CancellationToken cancellationToken);

        /// <summary>
        /// Withdraw a single right request by id
        /// </summary>
        /// <param name="id">The party that is performing the edit</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The http response from backend</returns>
        Task<bool> WithdrawSingleRightRequest(Guid id, CancellationToken cancellationToken);
    }
}