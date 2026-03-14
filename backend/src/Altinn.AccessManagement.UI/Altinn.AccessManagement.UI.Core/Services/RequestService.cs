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
        /// <param name="requestClient">The single rights client.</param>
        public RequestService(IRequestClient requestClient)
        {
            _requestClient = requestClient;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SingleRightRequest>> GetSingleRightRequests(Guid party, Guid from, Guid to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetSingleRightRequests(party, from, to, status, cancellationToken);
            return response.Items.Select(x =>
            {
                return new SingleRightRequest()
                {
                    Id = x.Id,
                    From = x.Connection.From,
                    To = x.Connection.To,
                    RequestType = x.RequestType,
                    Status = x.Status,
                    ResourceId = x.Resource.ResourceId
                };
            });
        }

        /// <inheritdoc />
        public async Task<bool> CreateSingleRightRequest(Guid party, Guid from, Guid to, string resource, CancellationToken cancellationToken)
        {
            return await _requestClient.CreateSingleRightRequest(party, from, to, resource, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawSingleRightRequest(Guid id, CancellationToken cancellationToken)
        {
            return await _requestClient.WithdrawSingleRightRequest(id, cancellationToken);
        }
    }
}