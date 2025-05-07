using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="ISystemUserChangeRequestClient"></see> interface
    /// </summary>
    public class SystemUserChangeRequestClientMock : ISystemUserChangeRequestClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SystemUserChangeRequestClientMock" /> class
        /// </summary>
        public SystemUserChangeRequestClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserChangeRequestClientMock).Assembly.Location).LocalPath), "Data");
        }
        
        /// <inheritdoc />
        public Task<Result<SystemUserChangeRequest>> GetSystemUserChangeRequest(Guid partyId, Guid changeRequestId, CancellationToken cancellationToken)
        {
            SystemUserChangeRequest systemUserChangeRequest = Util.GetMockData<SystemUserChangeRequest>($"{dataFolder}/SystemUser/systemUserChangeRequest.json");
            if (changeRequestId != systemUserChangeRequest.Id)
            {
                return Task.FromResult(new Result<SystemUserChangeRequest>(TestErrors.RequestNotFound));
            }

            return Task.FromResult(new Result<SystemUserChangeRequest>(systemUserChangeRequest));
        }

        /// <inheritdoc />
        public Task<Result<bool>> ApproveSystemUserChangeRequest(Guid partyId, Guid changeRequestId, CancellationToken cancellationToken)
        {
            SystemUserChangeRequest systemUserChangeRequest = Util.GetMockData<SystemUserChangeRequest>($"{dataFolder}/SystemUser/systemUserChangeRequest.json");
            if (changeRequestId != systemUserChangeRequest.Id)
            {
                return Task.FromResult(new Result<bool>(TestErrors.RequestNotFound));
            }
            return Task.FromResult(new Result<bool>(true));
        }

                /// <inheritdoc />
        public Task<Result<bool>> RejectSystemUserChangeRequest(Guid partyId, Guid changeRequestId, CancellationToken cancellationToken)
        {
            SystemUserChangeRequest systemUserChangeRequest = Util.GetMockData<SystemUserChangeRequest>($"{dataFolder}/SystemUser/systemUserChangeRequest.json");
            if (changeRequestId != systemUserChangeRequest.Id)
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
