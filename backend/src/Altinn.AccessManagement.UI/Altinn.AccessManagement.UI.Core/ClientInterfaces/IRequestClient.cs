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
        /// <param name="type">The type of requests to get. Either "resource" or "package"</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Paginated list of sent requests</returns>
        Task<PaginatedResult<Request>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, string type, CancellationToken cancellationToken);

        /// <summary>
        /// Get requests received by a party
        /// </summary>
        /// <param name="party">The acting party asking for received requests</param>
        /// <param name="from">The party who sent the requests</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="type">The type of requests to get. Either "resource" or "package"</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Paginated list of received requests</returns>
        Task<PaginatedResult<Request>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, string type, CancellationToken cancellationToken);

        /// <summary>
        /// Get a single request by id
        /// </summary>
        /// <param name="party">The acting party asking for the request</param>
        /// <param name="id">The request id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> GetRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Get a single draft request by id
        /// </summary>
        /// <param name="id">The request id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> GetDraftRequest(Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Create a new resource request
        /// </summary>
        /// <param name="party">The acting party creating the request</param>
        /// <param name="to">The party the request is directed to</param>
        /// <param name="resource">The resource to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken);

        /// <summary>
        /// Create a new package request
        /// </summary>
        /// <param name="party">The acting party creating the request</param>
        /// <param name="to">The party the request is directed to</param>
        /// <param name="package">The package to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> CreatePackageRequest(Guid party, Guid to, string package, CancellationToken cancellationToken);

        /// <summary>
        /// Withdraw a request by id
        /// </summary>
        /// <param name="party">The acting party withdrawing the request</param>
        /// <param name="id">The request id to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Confirm a draft request (transitions Draft → Pending)
        /// </summary>
        /// <param name="party">The acting party confirming the request</param>
        /// <param name="id">The request id to confirm</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> ConfirmRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Reject a pending request
        /// </summary>
        /// <param name="party">The acting party rejecting the request</param>
        /// <param name="id">The request id to reject</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> RejectRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Approve a pending request
        /// </summary>
        /// <param name="party">The acting party approving the request</param>
        /// <param name="id">The request id to approve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<Request> ApproveRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Get count of requests sent by a party
        /// </summary>
        /// <param name="party">The acting party asking for sent request count</param>
        /// <param name="to">The party the requests were sent to</param>
        /// <param name="status">The statuses to count</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Count of sent requests</returns>
        Task<int> GetSentRequestsCount(Guid party, Guid? to, List<RequestStatus> status, CancellationToken cancellationToken);

        /// <summary>
        /// Get count of requests received by a party
        /// </summary>
        /// <param name="party">The acting party asking for received request count</param>
        /// <param name="from">The party who sent the requests</param>
        /// <param name="status">The statuses to count</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Count of received requests</returns>
        Task<int> GetReceivedRequestsCount(Guid party, Guid? from, List<RequestStatus> status, CancellationToken cancellationToken);
    }
}
