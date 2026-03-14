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
        /// Get requests sent by a party
        /// </summary>
        /// <param name="party">The acting party asking for sent requests</param>
        /// <param name="to">The party the requests were sent to</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Paginated list of sent requests</returns>
        Task<PaginatedResult<RequestResourceDto>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, CancellationToken cancellationToken);

        /// <summary>
        /// Get requests received by a party
        /// </summary>
        /// <param name="party">The acting party asking for received requests</param>
        /// <param name="from">The party who sent the requests</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Paginated list of received requests</returns>
        Task<PaginatedResult<RequestResourceDto>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, CancellationToken cancellationToken);

        /// <summary>
        /// Get a single request by id
        /// </summary>
        /// <param name="party">The acting party asking for the request</param>
        /// <param name="id">The request id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<RequestResourceDto> GetRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Create a new resource request
        /// </summary>
        /// <param name="party">The acting party creating the request</param>
        /// <param name="to">The party the request is directed to</param>
        /// <param name="resource">The resource to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the request was created successfully</returns>
        Task<bool> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken);

        /// <summary>
        /// Withdraw a request by id
        /// </summary>
        /// <param name="party">The acting party withdrawing the request</param>
        /// <param name="id">The request id to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if the request was withdrawn successfully</returns>
        Task<bool> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken);
    }
}