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
        /// Get requests sent by a party
        /// </summary>
        /// <param name="party">The acting party asking for sent requests</param>
        /// <param name="to">The party the requests were sent to</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="type">The type of requests to get. Either "resource" or "package"</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of sent requests</returns>
        Task<IEnumerable<SingleRightRequest>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, string type, CancellationToken cancellationToken);

         /// <summary>
        /// Get enriched resource requests sent by a party
        /// </summary>
        /// <param name="party">The acting party asking for sent requests</param>
        /// <param name="to">The party the requests were sent to</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="languageCode">The language code for the response</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of enriched resource requests sent by a party</returns>
        Task<IEnumerable<EnrichedResourceRequest>> GetEnrichedSentResourceRequests(Guid party, Guid? to, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken);

        /// <summary>
        /// Get requests received by a party
        /// </summary>
        /// <param name="party">The acting party asking for received requests</param>
        /// <param name="from">The party who sent the requests</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="type">The type of requests to get. Either "resource" or "package"</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of received requests</returns>
        Task<IEnumerable<SingleRightRequest>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, string type, CancellationToken cancellationToken);

        /// <summary>
        /// Get enriched resource requests received by a party
        /// </summary>
        /// <param name="party">The acting party asking for received requests</param>
        /// <param name="from">The party who sent the requests</param>
        /// <param name="status">The statuses to get</param>
        /// <param name="languageCode">The language code for the response</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of received requests</returns>
        Task<IEnumerable<EnrichedResourceRequest>> GetEnrichedReceivedResourceRequests(Guid party, Guid? from, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken);

        /// <summary>
        /// Get a single request by id
        /// </summary>
        /// <param name="party">The acting party asking for the request</param>
        /// <param name="id">The request id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<SingleRightRequest> GetRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Creates a new resource request
        /// </summary>
        /// <param name="party">The acting party creating the request</param>
        /// <param name="to">The party the request is directed to</param>
        /// <param name="resource">The resource to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<SingleRightRequest> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken);

        /// <summary>
        /// Withdraw a request by id
        /// </summary>
        /// <param name="party">The acting party withdrawing the request</param>
        /// <param name="id">The request id to withdraw</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<SingleRightRequest> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Confirm a draft request (transitions Draft → Pending)
        /// </summary>
        /// <param name="party">The acting party confirming the request</param>
        /// <param name="id">The request id to confirm</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<SingleRightRequest> ConfirmRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Reject a pending request
        /// </summary>
        /// <param name="party">The acting party rejecting the request</param>
        /// <param name="id">The request id to reject</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<SingleRightRequest> RejectRequest(Guid party, Guid id, CancellationToken cancellationToken);

        /// <summary>
        /// Approve a pending request
        /// </summary>
        /// <param name="party">The acting party approving the request</param>
        /// <param name="id">The request id to approve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The request</returns>
        Task<SingleRightRequest> ApproveRequest(Guid party, Guid id, CancellationToken cancellationToken);
    }
}