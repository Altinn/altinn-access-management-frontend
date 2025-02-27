using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="ISystemUserClientDelegationRequestClient"></see> interface
    /// </summary>
    public class SystemUserClientDelegationRequestClientMock : ISystemUserClientDelegationRequestClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SystemUserClientDelegationRequestClientMock" /> class
        /// </summary>
        public SystemUserClientDelegationRequestClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserClientDelegationRequestClientMock).Assembly.Location).LocalPath), "Data");
        }
        
        /// <inheritdoc />
        public Task<Result<SystemUserClientDelegationRequest>> GetSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            SystemUserClientDelegationRequest systemUserClientDelegationRequest = Util.GetMockData<SystemUserClientDelegationRequest>($"{dataFolder}/SystemUser/systemUserClientDelegationRequest.json");
            if (clientDelegationRequestId != systemUserClientDelegationRequest.Id)
            {
                return Task.FromResult(new Result<SystemUserClientDelegationRequest>(TestErrors.RequestNotFound));
            }

            return Task.FromResult(new Result<SystemUserClientDelegationRequest>(systemUserClientDelegationRequest));
        }

        /// <inheritdoc />
        public Task<Result<bool>> ApproveSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            SystemUserClientDelegationRequest systemUserClientDelegationRequest = Util.GetMockData<SystemUserClientDelegationRequest>($"{dataFolder}/SystemUser/systemUserClientDelegationRequest.json");
            if (clientDelegationRequestId != systemUserClientDelegationRequest.Id)
            {
                return Task.FromResult(new Result<bool>(TestErrors.RequestNotFound));
            }
            return Task.FromResult(new Result<bool>(true));
        }

                /// <inheritdoc />
        public Task<Result<bool>> RejectSystemUserClientDelegationRequest(int partyId, Guid clientDelegationRequestId, CancellationToken cancellationToken)
        {
            SystemUserClientDelegationRequest systemUserClientDelegationRequest = Util.GetMockData<SystemUserClientDelegationRequest>($"{dataFolder}/SystemUser/systemUserClientDelegationRequest.json");
            if (clientDelegationRequestId != systemUserClientDelegationRequest.Id)
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
