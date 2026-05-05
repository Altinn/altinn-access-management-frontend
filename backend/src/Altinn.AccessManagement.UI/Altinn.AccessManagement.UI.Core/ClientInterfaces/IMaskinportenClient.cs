using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for Maskinporten administration API client.
    /// </summary>
    public interface IMaskinportenClient
    {
        /// <summary>
        /// Gets Maskinporten suppliers for a party, optionally filtered to a single supplier by org number.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="supplier">Optional supplier org number to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of suppliers.</returns>
        Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, string supplier = null, CancellationToken cancellationToken = default);

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

        /// <summary>
        /// Removes a Maskinporten supplier for a party.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="cascade">Whether to also remove all delegated resources.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveSupplier(Guid party, string supplier, bool cascade = false, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes a Maskinporten consumer connection (supplier relinquishes access).
        /// </summary>
        /// <param name="party">The party uuid (the supplier).</param>
        /// <param name="consumer">The consumer organization number.</param>
        /// <param name="cascade">Whether to also remove all delegated resources.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveConsumer(Guid party, string consumer, bool cascade = false, CancellationToken cancellationToken = default);
    }
}
