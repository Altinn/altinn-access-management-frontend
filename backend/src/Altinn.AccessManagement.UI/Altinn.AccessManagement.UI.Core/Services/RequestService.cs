using System.Text.Json;
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

        private readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestService"/> class.
        /// </summary>
        /// <param name="requestClient">The single rights client.</param>
        public RequestService(IRequestClient requestClient)
        {
            _requestClient = requestClient;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SingleRightRequest>> GetSingleRightRequests(Guid party, Guid to, Guid from, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetSingleRightRequests(party, to, from, status, cancellationToken);
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
        public async Task<bool> CreateSingleRightRequest(Guid party, Guid to, Guid from, string resource, CancellationToken cancellationToken)
        {
            CreateRequestInput payload = new()
            {
                Connection = new()
                {
                    To = to.ToString(),
                    From = from.ToString()
                },
                Resource = new()
                {
                    ResourceId = resource
                }
            };

            return await _requestClient.CreateSingleRightRequest(party, payload, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawSingleRightRequest(Guid id, CancellationToken cancellationToken)
        {
            return await _requestClient.WithdrawSingleRightRequest(id, cancellationToken);
        }
    }
}