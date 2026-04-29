using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for Maskinporten administration operations.
    /// </summary>
    public interface IMaskinportenService
    {
        /// <summary>
        /// Gets all Maskinporten suppliers for a party.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of suppliers.</returns>
        Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds a Maskinporten supplier for a party.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created assignment.</returns>
        Task<AssignmentDto> AddSupplier(Guid party, string supplier, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets all Maskinporten consumers for a party.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of consumers.</returns>
        Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default);
    }
}
