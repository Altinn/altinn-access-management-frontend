using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Exceptions;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Request;
using Altinn.AccessManagement.UI.Core.Models.Request.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.Register.Contracts.V1;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class RequestService : IRequestService
    {
        private readonly IRequestClient _requestClient;
        private readonly IAccessPackageClient _accessPackageClient;
        private readonly IRegisterClient _registerClient;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="RequestService"/> class.
        /// </summary>
        /// <param name="requestClient">The request client.</param>
        /// <param name="accessPackageClient">The access package client.</param>
        /// <param name="registerClient">The access register client.</param>
        /// <param name="resourceHelper">The resource helper.</param>
        public RequestService(IRequestClient requestClient, IAccessPackageClient accessPackageClient, IRegisterClient registerClient, ResourceHelper resourceHelper)
        {
            _requestClient = requestClient;
            _accessPackageClient = accessPackageClient;
            _registerClient = registerClient;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<RequestFE>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            PaginatedResult<Request> response = await _requestClient.GetSentRequests(party, to, status, type, cancellationToken);
            return response.Items.Select(MapToRequestFE);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<EnrichedResourceRequest>> GetEnrichedSentResourceRequests(Guid party, Guid? to, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<Request> response = await _requestClient.GetSentRequests(party, to, status, "resource", cancellationToken);
            return await MapToEnrichedResourceRequestList(response.Items, false, languageCode);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<RequestFE>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            PaginatedResult<Request> response = await _requestClient.GetReceivedRequests(party, from, status, type, cancellationToken);
            return response.Items.Select(MapToRequestFE);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<EnrichedResourceRequest>> GetEnrichedReceivedResourceRequests(Guid party, Guid? from, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<Request> response = await _requestClient.GetReceivedRequests(party, from, status, "resource", cancellationToken);
            return await MapToEnrichedResourceRequestList(response.Items, IsHandledStatus(status), languageCode);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<EnrichedPackageRequest>> GetEnrichedSentPackageRequests(Guid party, Guid? to, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<Request> response = await _requestClient.GetSentRequests(party, to, status, "package", cancellationToken);
            return await MapToEnrichedPackageRequestList(response.Items, false, languageCode);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<EnrichedPackageRequest>> GetEnrichedReceivedPackageRequests(Guid party, Guid? from, List<RequestStatus> status, string languageCode, CancellationToken cancellationToken)
        {
            PaginatedResult<Request> response = await _requestClient.GetReceivedRequests(party, from, status, "package", cancellationToken);
            return await MapToEnrichedPackageRequestList(response.Items, IsHandledStatus(status), languageCode);
        }

        /// <inheritdoc />
        public async Task<RequestFE> GetRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.GetRequest(party, id, cancellationToken);
            return MapToRequestFE(response);
        }

        /// <inheritdoc />
        public async Task<EnrichedResourceRequest> GetDraftRequest(Guid id, string languageCode, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.GetDraftRequest(id, cancellationToken);
            return (await MapToEnrichedResourceRequestList(new[] { response }, false, languageCode)).First();
        }

        /// <inheritdoc />
        public async Task<RequestFE> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.CreateResourceRequest(party, to, resource, cancellationToken);
            return MapToRequestFE(response);
        }

        /// <inheritdoc />
        public async Task<RequestFE> CreatePackageRequest(Guid party, Guid to, string package, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.CreatePackageRequest(party, to, package, cancellationToken);
            return MapToRequestFE(response);
        }

        /// <inheritdoc />
        public async Task<RequestFE> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.WithdrawRequest(party, id, cancellationToken);
            return MapToRequestFE(response);
        }

        /// <inheritdoc />
        public async Task<RequestFE> ConfirmRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.ConfirmRequest(party, id, cancellationToken);
            return MapToRequestFE(response);
        }

        /// <inheritdoc />
        public async Task<RequestFE> RejectRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.RejectRequest(party, id, cancellationToken);
            return MapToRequestFE(response);
        }

        /// <inheritdoc />
        public async Task<RequestFE> ApproveRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            Request response = await _requestClient.ApproveRequest(party, id, cancellationToken);
            return MapToRequestFE(response);
        }

        /// <inheritdoc />
        public async Task<int> GetSentRequestsCount(Guid party, Guid? to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            return await _requestClient.GetSentRequestsCount(party, to, status, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<int> GetReceivedRequestsCount(Guid party, Guid? from, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            return await _requestClient.GetReceivedRequestsCount(party, from, status, cancellationToken);
        }

        private static RequestFE MapToRequestFE(Request x)
        {
            return new RequestFE()
            {
                Id = x.Id,
                From = x.From,
                To = x.To,
                Type = x.Type,
                Status = x.Status,
                ResourceId = x.Resource?.ReferenceId,
                PackageId = x.Package?.ReferenceId,
                LastUpdated = x.LastUpdated
            };
        }

        private async Task<IEnumerable<EnrichedResourceRequest>> MapToEnrichedResourceRequestList(IEnumerable<Request> list, bool enrichUpdatedByName, string languageCode)
        {
            Dictionary<string, ServiceResourceFE> resourceDictionary = [];
            var uniqueResourceIds = list
                .Select(x => x.Resource.ReferenceId)
                .Distinct();
            var resources = await _resourceHelper.EnrichResources(uniqueResourceIds, languageCode);
            resourceDictionary = resources.ToDictionary(r => r.Identifier);

            Dictionary<Guid?, string> partyNameDict = enrichUpdatedByName ? await LookupLastUpdatedByParties(list) : [];

            return list.Select(x =>
            {
                RequestFE request = MapToRequestFE(x);

                if (!resourceDictionary.TryGetValue(request.ResourceId, out var resource))
                {
                    throw new ResourceNotFoundException($"Resource not found for ID: {request.ResourceId}");
                }

                partyNameDict.TryGetValue(x.LastUpdatedBy, out var lastUpdatedByName);
                return new EnrichedResourceRequest()
                {
                    Id = request.Id,
                    From = request.From,
                    To = request.To,
                    Type = request.Type,
                    Status = request.Status,
                    ResourceId = request.ResourceId,
                    LastUpdated = request.LastUpdated,
                    LastUpdatedByName = lastUpdatedByName,
                    Resource = resource
                };
            }).ToList();
        }

        private async Task<IEnumerable<EnrichedPackageRequest>> MapToEnrichedPackageRequestList(IEnumerable<Request> list, bool enrichUpdatedByName, string languageCode)
        {
            Dictionary<Guid, AccessPackage> packageDictionary = [];
            var uniquePackageIds = list
                .Select(x => x.Package.Id)
                .Distinct();

            foreach (var packageId in uniquePackageIds)
            {
                var package = await _accessPackageClient.GetAccessPackageById(languageCode, packageId);
                if (package == null)
                {
                    throw new ResourceNotFoundException($"Access package not found for ID: {packageId}");
                }

                packageDictionary[packageId] = package;
            }

            Dictionary<Guid?, string> partyNameDict = enrichUpdatedByName ? await LookupLastUpdatedByParties(list) : [];

            return list.Select(x =>
            {
                RequestFE request = MapToRequestFE(x);
                var packageId = x.Package.Id;

                if (!packageDictionary.TryGetValue(packageId, out var package))
                {
                    throw new ResourceNotFoundException($"Access package not found for ID: {packageId}");
                }

                partyNameDict.TryGetValue(x.LastUpdatedBy, out var lastUpdatedByName);
                return new EnrichedPackageRequest()
                {
                    Id = request.Id,
                    From = request.From,
                    To = request.To,
                    Type = request.Type,
                    Status = request.Status,
                    PackageId = request.PackageId,
                    LastUpdated = request.LastUpdated,
                    LastUpdatedByName = lastUpdatedByName,
                    Package = package
                };
            }).ToList();
        }

        // look up all parties from requests where LastUpdatedBy is set
        private async Task<Dictionary<Guid?, string>> LookupLastUpdatedByParties(IEnumerable<Request> list)
        {
            List<Guid> lastUpdatedNames = list
                .Select(request => request.LastUpdatedBy)
                .Where(x => x != null)
                .Select(x => x.Value)
                .Distinct()
                .ToList();

            List<Party> parties = await _registerClient.GetPartyList(lastUpdatedNames);
            return parties.ToDictionary(p => p.PartyUuid, p => p.Name);
        }

        private bool IsHandledStatus(List<RequestStatus> status)
        {
            return status.Contains(RequestStatus.Approved) || status.Contains(RequestStatus.Rejected);
        }
    }
}