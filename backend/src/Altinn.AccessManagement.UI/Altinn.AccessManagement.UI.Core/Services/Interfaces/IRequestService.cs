using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Request.Frontend;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Interface for service to handle requests
    /// </summary>
    public interface IRequestService
    {
        /// <summary>
        /// Get all requests for a party (as sender or receiver)
        /// </summary>
        /// <param name="party">The party that is performing the edit</param>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The http response from backend</returns>
        Task<IEnumerable<SingleRightRequest>> GetSingleRightRequests(Guid party, Guid from, Guid to, List<RequestStatus> status, CancellationToken cancellationToken);

        /// <summary>
        /// Creates a new single right request
        /// </summary>
        /// <param name="party">The party that is performing the edit</param>
        /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
        /// <param name="to">The right holder that has been granted access to the resource.</param>
        /// <param name="resource">The resource to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The http response from backend</returns>
        Task<bool> CreateSingleRightRequest(Guid party, Guid from, Guid to, string resource, CancellationToken cancellationToken);

        /// <summary>
        /// Withdraw a single right request by id
        /// </summary>
        /// <param name="id">The party that is performing the edit</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The http response from backend</returns>
        Task<bool> WithdrawSingleRightRequest(Guid id, CancellationToken cancellationToken);
    }
}