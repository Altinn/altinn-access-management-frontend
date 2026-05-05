using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
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
        public async Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, string supplier = null, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.GetSuppliers(party, supplier, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddSupplier(Guid party, string supplier, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.AddSupplier(party, supplier, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.GetConsumers(party, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveSupplier(Guid party, string supplier, bool cascade = false, CancellationToken cancellationToken = default)
        {
            await _maskinportenClient.RemoveSupplier(party, supplier, cascade, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveConsumer(Guid party, string consumer, bool cascade = false, CancellationToken cancellationToken = default)
        {
            await _maskinportenClient.RemoveConsumer(party, consumer, cascade, cancellationToken);
        }
    }
}
