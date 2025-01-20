using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    ///     Mock class for <see cref="ISystemRegisterClient"></see> interface
    /// </summary>
    public class SystemRegisterClientMock : ISystemRegisterClient
    {
        private readonly string dataFolder;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SystemRegisterClientMock" /> class
        /// </summary>
        public SystemRegisterClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(SystemRegisterClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<List<Right>> GetRightsFromSystem(string systemId, CancellationToken cancellationToken)
        {
            List<RegisteredSystem> systems = Util.GetMockData<List<RegisteredSystem>>($"{dataFolder}/SystemRegister/systems.json");
            return Task.FromResult(systems[0].Rights);
        }

        /// <inheritdoc />
        public Task<RegisteredSystem> GetSystem(string systemId, CancellationToken cancellationToken)
        {
            List<RegisteredSystem> systems = Util.GetMockData<List<RegisteredSystem>>($"{dataFolder}/SystemRegister/systems.json");
            return Task.FromResult(systems[0]);
        }

        /// <inheritdoc />
        public Task<List<RegisteredSystem>> GetSystems(CancellationToken cancellationToken)
        {
            List<RegisteredSystem> systems = Util.GetMockData<List<RegisteredSystem>>($"{dataFolder}/SystemRegister/systems.json");
            return Task.FromResult(systems);
        }
    }
}
