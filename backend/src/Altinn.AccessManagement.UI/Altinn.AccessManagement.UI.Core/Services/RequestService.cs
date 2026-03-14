using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Request;
using Altinn.AccessManagement.UI.Core.Models.Request.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class RequestService : IRequestService
    {
        private readonly IRequestClient _requestClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestService"/> class.
        /// </summary>
        /// <param name="requestClient">The request client.</param>
        public RequestService(IRequestClient requestClient)
        {
            _requestClient = requestClient;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SingleRightRequest>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetSentRequests(party, to, status, cancellationToken);
            return response.Items.Select(MapToSingleRightRequest);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SingleRightRequest>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetReceivedRequests(party, from, status, cancellationToken);
            return response.Items.Select(MapToSingleRightRequest);
        }

        /// <inheritdoc />
        public async Task<SingleRightRequest> GetRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            RequestResourceDto response = await _requestClient.GetRequest(party, id, cancellationToken);
            return MapToSingleRightRequest(response);
        }

        /// <inheritdoc />
        public async Task<bool> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken)
        {
            return await _requestClient.CreateResourceRequest(party, to, resource, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            return await _requestClient.WithdrawRequest(party, id, cancellationToken);
        }

        private static SingleRightRequest MapToSingleRightRequest(RequestResourceDto x)
        {
            return new SingleRightRequest()
            {
                Id = x.Id,
                From = x.From,
                To = x.To,
                RequestType = x.RequestType,
                Status = x.Status,
                ResourceId = x.Resource?.ResourceId,
                LastUpdated = x.LastUpdated
            };
        }
    }
}