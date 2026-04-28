using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Mocks.Utils;

namespace Altinn.AccessManagement.UI.Mocks.Mocks
{
    /// <summary>
    /// Mock class for <see cref="IMaskinportenClient"/>.
    /// </summary>
    public class MaskinportenClientMock : IMaskinportenClient
    {
        private readonly string dataFolder;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenClientMock"/> class.
        /// </summary>
        public MaskinportenClientMock()
        {
            dataFolder = Path.Combine(Path.GetDirectoryName(new Uri(typeof(MaskinportenClientMock).Assembly.Location).LocalPath), "Data");
        }

        /// <inheritdoc />
        public Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Maskinporten", "suppliers.json");
            IEnumerable<MaskinportenConnection> suppliers = Util.GetMockData<List<MaskinportenConnection>>(dataPath);
            return Task.FromResult(suppliers);
        }

        /// <inheritdoc />
        public Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default)
        {
            Util.ThrowExceptionIfTriggerParty(party.ToString());

            string dataPath = Path.Combine(dataFolder, "Maskinporten", "consumers.json");
            IEnumerable<MaskinportenConnection> consumers = Util.GetMockData<List<MaskinportenConnection>>(dataPath);
            return Task.FromResult(consumers);
        }
    }
}
