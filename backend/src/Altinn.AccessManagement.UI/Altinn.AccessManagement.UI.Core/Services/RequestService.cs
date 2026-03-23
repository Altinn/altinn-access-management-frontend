using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Request;
using Altinn.AccessManagement.UI.Core.Models.Request.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class RequestService : IRequestService
    {
        private readonly IRequestClient _requestClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestService"/> class.
        /// </summary>
        /// <param name="requestClient">The request client.</param>
        /// <param name="resourceHelper">The resource helper.</param>
        public RequestService(IRequestClient requestClient, ResourceHelper resourceHelper)
        {
            _requestClient = requestClient;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SingleRightRequest>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetSentRequests(party, to, status, null, cancellationToken);
            return response.Items.Select(MapToSingleRightRequest);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<EnrichedResourceRequest>> GetEnrichedSentResourceRequests(Guid party, Guid? to, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetSentRequests(party, to, status, "resource", cancellationToken);
            return await MapToEnrichedResourceRequestList(response, languageCode);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SingleRightRequest>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetReceivedRequests(party, from, status, null, cancellationToken);
            return response.Items.Select(MapToSingleRightRequest);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<EnrichedResourceRequest>> GetEnrichedReceivedResourceRequests(Guid party, Guid? from, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetReceivedRequests(party, from, status, "resource", cancellationToken);
            return await MapToEnrichedResourceRequestList(response, languageCode);
        }

        /// <inheritdoc />
        public async Task<SingleRightRequest> GetRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            RequestResourceDto response = await _requestClient.GetRequest(party, id, cancellationToken);
            return MapToSingleRightRequest(response);
        }

        /// <inheritdoc />
        public async Task<SingleRightRequest> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken)
        {
            RequestResourceDto response = await _requestClient.CreateResourceRequest(party, to, resource, cancellationToken);
            return MapToSingleRightRequest(response);
        }

        /// <inheritdoc />
        public async Task<SingleRightRequest> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            RequestResourceDto response = await _requestClient.WithdrawRequest(party, id, cancellationToken);
            return MapToSingleRightRequest(response);
        }

        /// <inheritdoc />
        public async Task<SingleRightRequest> ConfirmRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            RequestResourceDto response = await _requestClient.ConfirmRequest(party, id, cancellationToken);
            return MapToSingleRightRequest(response);
        }

        /// <inheritdoc />
        public async Task<SingleRightRequest> RejectRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            RequestResourceDto response = await _requestClient.RejectRequest(party, id, cancellationToken);
            return MapToSingleRightRequest(response);
        }

        /// <inheritdoc />
        public async Task<SingleRightRequest> ApproveRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            RequestResourceDto response = await _requestClient.ApproveRequest(party, id, cancellationToken);
            return MapToSingleRightRequest(response);
        }

        private static SingleRightRequest MapToSingleRightRequest(RequestResourceDto x)
        {
            return new SingleRightRequest()
            {
                Id = x.Id,
                From = x.From,
                To = x.To,
                Type = x.Type,
                Status = x.Status,
                ResourceId = x.Resource?.ReferenceId,
                LastUpdated = x.LastUpdated
            };
        }

        private async Task<IEnumerable<EnrichedResourceRequest>> MapToEnrichedResourceRequestList(PaginatedResult<RequestResourceDto> list, string languageCode)
        {
            Dictionary<string, ServiceResourceFE> resourceDictionary = [];
            var uniqueResourceIds = list.Items
                .Select(x => x.Resource.ReferenceId)
                .Distinct();
            var resources = await _resourceHelper.EnrichResources(uniqueResourceIds, languageCode);
            resourceDictionary = resources.ToDictionary(r => r.Identifier);
            
            return list.Items.Select(x => 
            {
                SingleRightRequest request = MapToSingleRightRequest(x);
                EnrichedResourceRequest enrichedRequest = new EnrichedResourceRequest()
                {
                    Id = request.Id,
                    From = request.From,
                    To = request.To,
                    Type = request.Type,
                    Status = request.Status,
                    ResourceId = request.ResourceId,
                    LastUpdated = request.LastUpdated,
                };
                
                if (resourceDictionary.TryGetValue(x.Resource.ReferenceId, out var resource))
                {
                    enrichedRequest.Resource = resource;
                }
                
                return enrichedRequest;
            });
        }
    }
}