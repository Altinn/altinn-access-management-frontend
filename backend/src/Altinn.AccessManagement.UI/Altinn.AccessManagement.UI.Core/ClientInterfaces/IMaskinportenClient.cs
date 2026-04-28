using Altinn.AccessManagement.UI.Core.Models.Maskinporten;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for Maskinporten administration API client.
    /// </summary>
    public interface IMaskinportenClient
    {
        /// <summary>
        /// Gets all Maskinporten suppliers for a party.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of suppliers.</returns>
        Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets all Maskinporten consumers for a party.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of consumers.</returns>
        Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, CancellationToken cancellationToken = default);
    }
}
