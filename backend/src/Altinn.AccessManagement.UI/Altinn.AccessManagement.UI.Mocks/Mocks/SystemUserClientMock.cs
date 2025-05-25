using System.Net;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="ISystemUserClient"></see> interface
    /// </summary>
    public class SystemUserClientMock : ISystemUserClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SystemUserClientMock" /> class
        /// </summary>
        public SystemUserClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserClientMock).Assembly.Location).LocalPath), "Data");
        }
        
        /// <inheritdoc />
        public Task<Result<SystemUser>> CreateNewSystemUser(int partyId, NewSystemUserRequest newSystemUser, CancellationToken cancellationToken)
        {
            List<RegisteredSystem> systems = Util.GetMockData<List<RegisteredSystem>>($"{dataFolder}/SystemRegister/systems.json");
            RegisteredSystem system = systems.Find(s => s.SystemId == newSystemUser.SystemId);
            if (system is null)
            {
                return Task.FromResult(new Result<SystemUser>(TestErrors.SystemNotFound));
            }
            SystemUser createdSystemUser = new SystemUser
            {
                Id = "eb9c9edf-a32f-424c-b475-6d47a0e7621f",
                PartyId = partyId.ToString(),
                IntegrationTitle = newSystemUser.IntegrationTitle,
                SystemId = newSystemUser.SystemId,

            };
            return Task.FromResult(new Result<SystemUser>(createdSystemUser));
        }

        /// <inheritdoc />
        public Task<bool> DeleteSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            List<SystemUser> systemUsers = Util.GetMockData<List<SystemUser>>($"{dataFolder}/SystemUser/systemUsers.json");
            SystemUser systemUser = systemUsers.Find(s => s.Id == id.ToString() && s.PartyId == partyId.ToString());
            if (systemUser is null)
            {
                return Task.FromResult(false);
            }
            return Task.FromResult(true);
        }

        /// <inheritdoc />
        public Task<SystemUser> GetSpecificSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            List<SystemUser> systemUsers = Util.GetMockData<List<SystemUser>>($"{dataFolder}/SystemUser/systemUsers.json");
            SystemUser systemUser = systemUsers.Find(s => s.Id == id.ToString() && s.PartyId == partyId.ToString());
            return Task.FromResult(systemUser);
        }
        
        /// <inheritdoc />
        public Task<List<SystemUser>> GetSystemUsersForParty(int partyId, CancellationToken cancellationToken)
        {
            List<SystemUser> systemUsers = Util.GetMockData<List<SystemUser>>($"{dataFolder}/SystemUser/systemUsers.json");
            return Task.FromResult(systemUsers);
        }

        /// <inheritdoc />
        public Task<SystemUser> GetAgentSystemUser(int partyId, Guid id, CancellationToken cancellationToken)
        {
            List<SystemUser> systemUsers = Util.GetMockData<List<SystemUser>>($"{dataFolder}/SystemUser/agentSystemUsers.json");
            SystemUser systemUser = systemUsers.Find(s => s.Id == id.ToString() && s.PartyId == partyId.ToString());
            return Task.FromResult(systemUser);
        }
        
        /// <inheritdoc />
        public Task<List<SystemUser>> GetAgentSystemUsersForParty(int partyId, CancellationToken cancellationToken)
        {
            List<SystemUser> systemUsers = Util.GetMockData<List<SystemUser>>($"{dataFolder}/SystemUser/agentSystemUsers.json");
            return Task.FromResult(systemUsers);
        }

        /// <inheritdoc />
        public Task<Result<bool>> DeleteAgentSystemUser(int partyId, Guid systemUserId, Guid facilitatorId, CancellationToken cancellationToken)
        {
            List<SystemUser> agentSystemUsers = Util.GetMockData<List<SystemUser>>($"{dataFolder}/SystemUser/agentSystemUsers.json");
            SystemUser systemUser = agentSystemUsers.Find(s => s.Id == systemUserId.ToString() && s.PartyId == partyId.ToString());
            if (systemUser is null)
            {
                return Task.FromResult(new Result<bool>(TestErrors.SystemNotFound));
            }
            return Task.FromResult(new Result<bool>(true));
        }

        /// <inheritdoc />
        public Task<Result<List<Customer>>> GetClients(int partyId, Guid facilitatorId, List<string> accessPackages, CancellationToken cancellationToken)
        {
            string dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemRegisterClientMock).Assembly.Location).LocalPath), "Data");
            string jsonFile = ""; 
            
            if (accessPackages.Any(x => x == "ansvarlig-revisor" || x == "revisormedarbeider"))
            {
                jsonFile = "revisorCustomers.json";
            }
            else if (accessPackages.Any(x => x == "regnskapsforer-med-signeringsrettighet" 
                                         || x == "regnskapsforer-uten-signeringsrettighet" 
                                         || x == "regnskapsforer-lonn"))
            {
                jsonFile = "regnskapsforerCustomers.json";
            }
            else if (accessPackages.Any(x => x == "forretningsforer-eiendom"))
            {
                jsonFile = "forretningsforerCustomers.json";
            }
            else
            {
                // No known access package → return empty result
                return Task.FromResult(new Result<List<Customer>>(new List<Customer>()));
            }

            if (string.IsNullOrEmpty(jsonFile))
            {
                // Safety guard: if jsonFile somehow still empty
                return Task.FromResult(new Result<List<Customer>>(new List<Customer>()));
            }

            List<Customer> customers = Util.GetMockData<List<Customer>>($"{dataFolder}/SystemUser/{jsonFile}");
            
            return Task.FromResult(new Result<List<Customer>>(customers));
        }

        internal static class TestErrors
        {
            private static readonly ProblemDescriptorFactory _factory
                = ProblemDescriptorFactory.New("AMUI");

            public static ProblemDescriptor SystemNotFound { get; }
                = _factory.Create(11, HttpStatusCode.NotFound, "System not found");
        }
    }
}