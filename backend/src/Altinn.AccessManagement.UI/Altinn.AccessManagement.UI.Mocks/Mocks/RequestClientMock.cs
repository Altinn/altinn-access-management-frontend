using System.Text.Json;
using System.Text.Json.Serialization;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
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
            ILogger<AccessManagementClientMock> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(AccessManagementClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public async Task<PaginatedResult<RequestResourceDto>> GetSingleRightRequests(Guid party, Guid from, Guid to, List<RequestStatus> status, CancellationToken cancellationToken)
        {
            string dataPath = Path.Combine(dataFolder, "Request", "requests.json");
            return await Task.FromResult(Util.GetMockData<PaginatedResult<RequestResourceDto>>(dataPath));
        }

        /// <inheritdoc />
        public async Task<bool> CreateSingleRightRequest(Guid party, CreateRequestInput payload, CancellationToken cancellationToken)
        {
            return await Task.FromResult(true);
        }

        /// <inheritdoc />
        public async Task<bool> WithdrawSingleRightRequest(Guid id, CancellationToken cancellationToken)
        {
            return await Task.FromResult(true);
        }
    }
}