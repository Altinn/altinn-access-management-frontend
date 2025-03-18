using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="ISystemUserAgentDelegationClient"></see> interface
    /// </summary>
    public class SystemUserAgentDelegationClientMock : ISystemUserAgentDelegationClient
    {
        private readonly string dataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserAgentDelegationClientMock"/> class
        /// </summary>
        public SystemUserAgentDelegationClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserClientMock).Assembly.Location).LocalPath), "Data");
        }

        public Task<List<AgentDelegation>> GetSystemUserAgentDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            Guid regnskapsforerSystemUserId = Guid.Parse("61844188-3789-4b84-9314-2be1fdbc6633");
            Guid revisorSystemUserId = Guid.Parse("244c56a5-3737-44ac-8f3b-8697c5e281da");
            Guid forretningsforerSystemUserId = Guid.Parse("095b06de-1a93-4320-b572-42d72949cf2c");

            string jsonFile = null;
            if (systemUserGuid == regnskapsforerSystemUserId)
            {
                jsonFile = "regnskapsforerAgentDelegations.json";
            }
            else if (systemUserGuid == revisorSystemUserId)
            {
                jsonFile = "revisorAgentDelegations.json";
            }
            else if (systemUserGuid == forretningsforerSystemUserId)
            {
                jsonFile = "forretningsforerAgentDelegations.json";
            }

            if (jsonFile != null)
            {
                List<AgentDelegation> delegations = Util.GetMockData<List<AgentDelegation>>($"{dataFolder}/SystemUser/{jsonFile}");
                return Task.FromResult(delegations);
            }

            return Task.FromResult(new List<AgentDelegation>());
        }

        public Task<Result<AgentDelegation>> AddClient(int partyId, Guid systemUserGuid, AgentDelegationRequest delegationRequest, CancellationToken cancellationToken)
        {
            if (delegationRequest.CustomerUuid.Equals(Guid.Parse("82cc64c5-60ff-4184-8c07-964c3a1e6fc7"))) 
            {
                return Task.FromResult(new Result<AgentDelegation>(TestErrors.CustomerNotFound));
            }
            return Task.FromResult(new Result<AgentDelegation>(new AgentDelegation()
            {
                Id = Guid.NewGuid(),
                Facilitator = new DelegationParty(),
                From = new DelegationParty()
                {
                    Id = delegationRequest.CustomerUuid
                },
                To = new DelegationParty()
            }));
        }

        public Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, Guid assignmentId, CancellationToken cancellationToken)
        {
            if (assignmentId.Equals(Guid.Parse("60f1ade9-ed48-4083-a369-178d45d6ffd1"))) 
            {
                return Task.FromResult(new Result<bool>(TestErrors.CustomerNotFound));
            }
            return Task.FromResult(new Result<bool>(true));
        }

        internal static class TestErrors
        {
            private static readonly ProblemDescriptorFactory _factory
                = ProblemDescriptorFactory.New("AUTH");

            public static ProblemDescriptor CustomerNotFound { get; }
                = _factory.Create(10, HttpStatusCode.NotFound, "Customer not found");
        }
    }
}