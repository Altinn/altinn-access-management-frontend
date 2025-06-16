using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="ISystemUserRequestClient"></see> interface
    /// </summary>
    public class SystemUserRequestClientMock : ISystemUserRequestClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SystemUserRequestClientMock" /> class
        /// </summary>
        public SystemUserRequestClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserRequestClientMock).Assembly.Location).LocalPath), "Data");
        }
        
        /// <inheritdoc />
        public Task<Result<SystemUserRequest>> GetSystemUserRequest(Guid requestId, CancellationToken cancellationToken)
        {
            SystemUserRequest systemUserRequest = Util.GetMockData<SystemUserRequest>($"{dataFolder}/SystemUser/systemUserRequest.json");
            if (requestId != systemUserRequest.Id)
            {
                return Task.FromResult(new Result<SystemUserRequest>(TestErrors.RequestNotFound));
            }

            return Task.FromResult(new Result<SystemUserRequest>(systemUserRequest));
        }

        /// <inheritdoc />
        public Task<Result<bool>> ApproveSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken)
        {
            SystemUserRequest systemUserRequest = Util.GetMockData<SystemUserRequest>($"{dataFolder}/SystemUser/systemUserRequest.json");
            if (requestId != systemUserRequest.Id)
            {
                return Task.FromResult(new Result<bool>(TestErrors.RequestNotFound));
            }
            return Task.FromResult(new Result<bool>(true));
        }

                /// <inheritdoc />
        public Task<Result<bool>> RejectSystemUserRequest(int partyId, Guid requestId, CancellationToken cancellationToken)
        {
            SystemUserRequest systemUserRequest = Util.GetMockData<SystemUserRequest>($"{dataFolder}/SystemUser/systemUserRequest.json");
            if (requestId != systemUserRequest.Id)
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
