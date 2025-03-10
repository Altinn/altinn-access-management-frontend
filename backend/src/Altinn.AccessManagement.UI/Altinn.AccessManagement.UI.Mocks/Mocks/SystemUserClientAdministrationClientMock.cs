using System.Text.Json;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;
using Altinn.Authorization.ProblemDetails;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IPartiesClient"></see> interface
    /// </summary>
    public class SystemUserClientAdministrationClientMock : ISystemUserClientAdministrationClient
    {
        private readonly string dataFolder;
   
        private static readonly JsonSerializerOptions _options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserClientAdministrationClientMock"/> class
        /// </summary>
        public SystemUserClientAdministrationClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemUserClientMock).Assembly.Location).LocalPath), "Data");
        }

        public Task<List<ClientDelegation>> GetSystemUserClientDelegations(int partyId, Guid systemUserGuid, CancellationToken cancellationToken)
        {
            string jsonFile = systemUserGuid == new Guid("61844188-3789-4b84-9314-2be1fdbc6633") ? "regnskapsforerClientDelegations.json" : "revisorClientDelegations.json";
            List<ClientDelegation> delegations = Util.GetMockData<List<ClientDelegation>>($"{dataFolder}/SystemUser/{jsonFile}");

            return Task.FromResult(delegations);
        }

        public Task<Result<bool>> AddClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return Task.FromResult(new Result<bool>(true));
        }

        public Task<Result<bool>> RemoveClient(int partyId, Guid systemUserGuid, int customerPartyId, CancellationToken cancellationToken)
        {
            return Task.FromResult(new Result<bool>(true));
        }
    }
}
