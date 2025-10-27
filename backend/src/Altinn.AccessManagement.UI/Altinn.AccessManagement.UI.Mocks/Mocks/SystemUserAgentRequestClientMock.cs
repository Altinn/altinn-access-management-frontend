using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="ISystemUserAgentRequestClient"></see> interface
    /// </summary>
    public class SystemUserAgentRequestClientMock : ISystemUserAgentRequestClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SystemUserAgentRequestClientMock" /> class
        /// </summary>
        public SystemUserAgentRequestClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserAgentRequestClientMock).Assembly.Location).LocalPath), "Data");
        }
        
        /// <inheritdoc />
        public Task<Result<SystemUserRequest>> GetSystemUserAgentRequest(Guid agentRequestId, CancellationToken cancellationToken)
        {
            SystemUserRequest systemUserAgentRequest = Util.GetMockData<SystemUserRequest>($"{dataFolder}/SystemUser/systemUserAgentRequest.json");
            if (agentRequestId != systemUserAgentRequest.Id)
            {
                return Task.FromResult(new Result<SystemUserRequest>(TestErrors.RequestNotFound));
            }

            return Task.FromResult(new Result<SystemUserRequest>(systemUserAgentRequest));
        }

        /// <inheritdoc />
        public Task<Result<List<SystemUserRequest>>> GetPendingAgentSystemUserRequests(int partyId, CancellationToken cancellationToken)
        {
            List<SystemUserRequest> systemUserAgentRequests = Util.GetMockData<List<SystemUserRequest>>($"{dataFolder}/SystemUser/pendingAgentRequests.json");
            return Task.FromResult(new Result<List<SystemUserRequest>>([.. systemUserAgentRequests]));
        }

        /// <inheritdoc />
        public Task<Result<bool>> ApproveSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {
            return ValidateAndExecuteAction(agentRequestId, cancellationToken);
        }

        /// <inheritdoc />
        public Task<Result<bool>> RejectSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {
            return ValidateAndExecuteAction(agentRequestId, cancellationToken);
        }

        /// <inheritdoc />
        public Task<Result<bool>> EscalateSystemUserAgentRequest(int partyId, Guid agentRequestId, CancellationToken cancellationToken)
        {
            return ValidateAndExecuteAction(agentRequestId, cancellationToken);
        }

        private Task<Result<bool>> ValidateAndExecuteAction(Guid agentRequestId, CancellationToken cancellationToken)
        {
            SystemUserRequest systemUserAgentRequest = Util.GetMockData<SystemUserRequest>($"{dataFolder}/SystemUser/systemUserAgentRequest.json");
            if (agentRequestId != systemUserAgentRequest.Id)
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
