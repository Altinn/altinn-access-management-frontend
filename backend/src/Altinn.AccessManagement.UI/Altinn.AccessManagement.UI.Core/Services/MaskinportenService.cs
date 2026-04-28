using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the Maskinporten administration API.
    /// </summary>
    public class MaskinportenService : IMaskinportenService
    {
        private readonly IMaskinportenClient _maskinportenClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenService"/> class.
        /// </summary>
        /// <param name="maskinportenClient">Maskinporten client.</param>
        public MaskinportenService(IMaskinportenClient maskinportenClient)
        {
            _maskinportenClient = maskinportenClient;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.GetSuppliers(party, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.GetConsumers(party, cancellationToken);
        }
    }
}
