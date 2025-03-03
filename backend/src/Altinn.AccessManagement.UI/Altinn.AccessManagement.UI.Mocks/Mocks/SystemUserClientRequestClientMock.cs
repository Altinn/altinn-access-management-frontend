using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="ISystemUserClientRequestClient"></see> interface
    /// </summary>
    public class SystemUserClientRequestClientMock : ISystemUserClientRequestClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SystemUserClientRequestClientMock" /> class
        /// </summary>
        public SystemUserClientRequestClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserClientRequestClientMock).Assembly.Location).LocalPath), "Data");
        }
        
        /// <inheritdoc />
        public Task<Result<SystemUserClientRequest>> GetSystemUserClientRequest(int partyId, Guid ClientRequestId, CancellationToken cancellationToken)
        {
            SystemUserClientRequest systemUserClientRequest = Util.GetMockData<SystemUserClientRequest>($"{dataFolder}/SystemUser/systemUserClientRequest.json");
            if (ClientRequestId != systemUserClientRequest.Id)
            {
                return Task.FromResult(new Result<SystemUserClientRequest>(TestErrors.RequestNotFound));
            }

            return Task.FromResult(new Result<SystemUserClientRequest>(systemUserClientRequest));
        }

        /// <inheritdoc />
        public Task<Result<bool>> ApproveSystemUserClientRequest(int partyId, Guid ClientRequestId, CancellationToken cancellationToken)
        {
            SystemUserClientRequest systemUserClientRequest = Util.GetMockData<SystemUserClientRequest>($"{dataFolder}/SystemUser/systemUserClientRequest.json");
            if (ClientRequestId != systemUserClientRequest.Id)
            {
                return Task.FromResult(new Result<bool>(TestErrors.RequestNotFound));
            }
            return Task.FromResult(new Result<bool>(true));
        }

                /// <inheritdoc />
        public Task<Result<bool>> RejectSystemUserClientRequest(int partyId, Guid ClientRequestId, CancellationToken cancellationToken)
        {
            SystemUserClientRequest systemUserClientRequest = Util.GetMockData<SystemUserClientRequest>($"{dataFolder}/SystemUser/systemUserClientRequest.json");
            if (ClientRequestId != systemUserClientRequest.Id)
            {
                return Task.FromResult(new Result<bool>(TestErrors.RequestNotFound));
            }
            return Task.FromResult(new Result<bool>(true));
        }        

        internal static class TestErrors
        {
            private static readonly ProblemDescriptorFactory _factory
                = ProblemDescriptorFactory.New("AUTH");

            public static ProblemDescriptor RequestNotFound { get; }
                = _factory.Create(10, HttpStatusCode.NotFound, "Request not found");
        }
    }
}
