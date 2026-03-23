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
        public async Task<PaginatedResult<RequestResourceDto>> GetSentRequests(Guid party, Guid? to, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "sentRequests.json");
            if (party == Guid.Parse("22222222-2222-2222-2222-222222222222"))
            {
                dataPath = Path.Combine(dataFolder, "Request", "sentRequestsInvalidResource.json");
            }
            return await Task.FromResult(Util.GetMockData<PaginatedResult<RequestResourceDto>>(dataPath));
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<RequestResourceDto>> GetReceivedRequests(Guid party, Guid? from, List<RequestStatus> status, string type, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "receivedRequests.json");
            if (party == Guid.Parse("22222222-2222-2222-2222-222222222222"))
            {
                dataPath = Path.Combine(dataFolder, "Request", "receivedRequestsInvalidResource.json");
            }
            return await Task.FromResult(Util.GetMockData<PaginatedResult<RequestResourceDto>>(dataPath));
        }

        /// <inheritdoc />
        public async Task<RequestResourceDto> GetRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<RequestResourceDto>(dataPath));
        }

        /// <inheritdoc />
        public async Task<RequestResourceDto> CreateResourceRequest(Guid party, Guid to, string resource, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<RequestResourceDto>(dataPath));
        }

        /// <inheritdoc />
        public async Task<RequestResourceDto> WithdrawRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<RequestResourceDto>(dataPath));
        }

        /// <inheritdoc />
        public async Task<RequestResourceDto> ConfirmRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<RequestResourceDto>(dataPath));
        }

        /// <inheritdoc />
        public async Task<RequestResourceDto> RejectRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<RequestResourceDto>(dataPath));
        }

        /// <inheritdoc />
        public async Task<RequestResourceDto> ApproveRequest(Guid party, Guid id, CancellationToken cancellationToken)
        {
            ThrowExceptionIfTriggerParty(party.ToString());
            ThrowHttpStatusExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Request", "singleRequest.json");
            return await Task.FromResult(Util.GetMockData<RequestResourceDto>(dataPath));
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
    }
}