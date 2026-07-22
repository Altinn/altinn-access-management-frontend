using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Request;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="IRequestClient"></see> interface
    /// </summary>
    public class RequestClientMock : IRequestClient
    {
        private static readonly JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };
        private readonly string dataFolder;

        // Party that triggers the handled-requests test data (mix of pending, recently handled and old handled requests)
        private static readonly Guid HandledRequestsTriggerParty = Guid.Parse("55555555-5555-5555-5555-555555555555");

        // The one handled request that should always be considered "recent" (within the last year)
        private static readonly Guid RecentHandledRequestId = Guid.Parse("5a11ab1e-0000-0000-0000-000000000002");

        /// <summary>
        ///     Initializes a new instance of the <see cref="RequestClientMock" /> class
        /// </summary>
        public RequestClientMock(HttpClient httpClient,
            ILogger<RequestClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<Request>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath;
            if (type == "package")
            {
                dataPath = party == Guid.Parse("22222222-2222-2222-2222-222222222222")
                    ? Path.Combine(dataFolder, "Request", "sentPackageRequestsInvalidPackage.json")
                    : Path.Combine(dataFolder, "Request", "sentPackageRequests.json");
            }
            else
            {
                if (party == HandledRequestsTriggerParty)
                {
                    return await Task.FromResult(GetHandledRequestsMockData());
                }

                dataPath = party == Guid.Parse("22222222-2222-2222-2222-222222222222")
                    ? Path.Combine(dataFolder, "Request", "sentRequestsInvalidResource.json")
                    : party == Guid.Parse("33333333-3333-3333-3333-333333333333")
                        ? Path.Combine(dataFolder, "Request", "sentRequestsNullResource.json")
                        : Path.Combine(dataFolder, "Request", "sentRequests.json");
            }

            return await Task.FromResult(Util.GetMockData<PaginatedResult<Request>>(dataPath));
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<Request>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath;
            if (type == "package")
            {
                dataPath = party == Guid.Parse("22222222-2222-2222-2222-222222222222")
                    ? Path.Combine(dataFolder, "Request", "receivedPackageRequestsInvalidPackage.json")
                    : Path.Combine(dataFolder, "Request", "receivedPackageRequests.json");
            }
            else
            {
                if (party == HandledRequestsTriggerParty)
                {
                    return await Task.FromResult(GetHandledRequestsMockData());
                }

                dataPath = party == Guid.Parse("22222222-2222-2222-2222-222222222222")
                    ? Path.Combine(dataFolder, "Request", "receivedRequestsInvalidResource.json")
                    : Path.Combine(dataFolder, "Request", "receivedRequests.json");
            }

            return await Task.FromResult(Util.GetMockData<PaginatedResult<Request>>(dataPath));
        }

        /// <inheritdoc />
        public async Task<Request> GetRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        /// <inheritdoc />
        public async Task<Request> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        /// <inheritdoc />
        public async Task<Request> CreatePackageRequest(Guid party, Guid to, string package, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = party == Guid.Parse("33333333-3333-3333-3333-333333333333")
                ? Path.Combine(dataFolder, "Request", "singlePackageRequestNullPackage.json")
                : Path.Combine(dataFolder, "Request", "singlePackageRequest.json");
            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        /// <inheritdoc />
        public async Task<Request> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerRequest(id);

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        /// <inheritdoc />
        public async Task<Request> ConfirmRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerRequest(id);

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        /// <inheritdoc />
        public async Task<Request> RejectRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        /// <inheritdoc />
        public async Task<Request> ApproveRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        public async Task<Request> GetDraftRequest(Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(id.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(id.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "draftRequest.json");
            if (id == Guid.Parse("22222222-2222-2222-2222-222222222222"))
            {
                dataPath = Path.Combine(dataFolder, "Request", "draftRequestInvalidResource.json");
            }
            else if (id == Guid.Parse("44444444-4444-4444-4444-444444444444"))
            {
                dataPath = Path.Combine(dataFolder, "Request", "draftPackageRequest.json");
            }
            else if (id == Guid.Parse("44444444-4444-4444-4444-444444444442"))
            {
                dataPath = Path.Combine(dataFolder, "Request", "draftPackageRequestByggesoknad.json");
            }
            else if (id == Guid.Parse("44444444-4444-4444-4444-444444444440"))
            {
                dataPath = Path.Combine(dataFolder, "Request", "draftPackageRequestConfirmError.json");
            }

            return await Task.FromResult(Util.GetMockData<Request>(dataPath));
        }

        /// <inheritdoc />
        public async Task<int> GetSentRequestsCount(Guid party, Guid? to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            return await Task.FromResult(3);
        }

        /// <inheritdoc />
        public async Task<int> GetReceivedRequestsCount(Guid party, Guid? from, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            return await Task.FromResult(3);
        }

        // Loads the handled-requests test data and stamps the "recent" handled request with the current
        // time, so the one-year filter test stays deterministic regardless of when it runs.
        private PaginatedResult<Request> GetHandledRequestsMockData()
        {
            string dataPath = Path.Combine(dataFolder, "Request", "handledRequestsFilter.json");
            PaginatedResult<Request> result = Util.GetMockData<PaginatedResult<Request>>(dataPath);

            foreach (Request request in result.Items.Where(r => r.Id == RecentHandledRequestId))
            {
                request.LastUpdated = DateTimeOffset.UtcNow;
            }

            return result;
        }

        private static void ThrowExceptionIfTriggerParty(string id)
        {
            if (id == "00000000-0000-0000-0000-000000000000")
            {
                throw new Exception("Simulated internal error");
            }
        }

        private static void ThrowHttpStatusExceptionIfTriggerParty(string id)
        {
            if (id == "11111111-1111-1111-1111-111111111111")
            {
                throw new HttpStatusException("StatusError", "Simulated backend error", HttpStatusCode.BadRequest, "");
            }
        }

        private static void ThrowHttpStatusExceptionIfTriggerRequest(Guid id)
        {
            if (id == Guid.Parse("44444444-4444-4444-4444-444444444440"))
            {
                throw new HttpStatusException("StatusError", "Simulated confirm/withdraw error", HttpStatusCode.BadRequest, "");
            }
        }
    }
}