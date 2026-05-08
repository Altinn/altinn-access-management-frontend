using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

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
        /// Performs a delegation check for a Maskinporten scope resource.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="languageCode">The language code.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The resource delegation check.</returns>
        Task<ResourceCheckDto> ResourceDelegationCheck(Guid party, string resource, string languageCode, CancellationToken cancellationToken = default);

        /// <summary>
        /// Delegates a Maskinporten scope resource to a supplier.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Whether the resource was delegated.</returns>
        Task<bool> AddResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets delegated Maskinporten scope resources.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="supplier">Optional supplier organization number.</param>
        /// <param name="resource">Optional resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of delegated resources.</returns>
        Task<IEnumerable<ResourcePermission>> GetResources(Guid party, string supplier = null, string resource = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes a delegated Maskinporten scope resource from a supplier.
        /// </summary>
        /// <param name="party">The party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default);

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
