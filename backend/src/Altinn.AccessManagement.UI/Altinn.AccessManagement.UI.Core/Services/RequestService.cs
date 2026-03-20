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
        public async Task<IEnumerable<SingleRightRequest>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, bool includeResources, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetSentRequests(party, to, status, cancellationToken);
            return await MapRequestList(response, includeResources, languageCode);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<SingleRightRequest>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, bool includeResources, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<RequestResourceDto> response = await _requestClient.GetReceivedRequests(party, from, status, cancellationToken);
            return await MapRequestList(response, includeResources, languageCode);
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

        private async Task<IEnumerable<SingleRightRequest>> MapRequestList(PaginatedResult<RequestResourceDto> list, bool includeResources, string languageCode)
        {
            Dictionary<string, ServiceResourceFE> resourceDictionary = [];
            if (includeResources)
            {
                var uniqueResourceIds = list.Items
                    .Select(x => x.Resource.ReferenceId)
                    .Distinct();
                var resources = await _resourceHelper.EnrichResources(uniqueResourceIds, languageCode);
                resourceDictionary = resources.ToDictionary(r => r.Identifier);
            }
            
            return list.Items.Select(x => 
            {
                SingleRightRequest request = MapToSingleRightRequest(x);
                if (resourceDictionary.TryGetValue(x.Resource.ReferenceId, out var resource))
                {
                    request.Resource = resource;
                }
                
                return request;
            });
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
    }
}