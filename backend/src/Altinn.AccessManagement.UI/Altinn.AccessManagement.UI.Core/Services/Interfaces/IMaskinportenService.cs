using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for Maskinporten administration operations.
    /// </summary>
    public interface IMaskinportenService
    {
        /// <summary>
        /// Gets Maskinporten suppliers for a consumer party, optionally filtered to a single supplier by org number.
        /// </summary>
        /// <param name="party">The consumer party uuid.</param>
        /// <param name="supplier">Optional supplier org number to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of suppliers.</returns>
        Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, string supplier = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Searches Maskinporten scope resources.
        /// </summary>
        /// <param name="languageCode">The language code.</param>
        /// <param name="searchParams">The search parameters.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Paginated Maskinporten scope resources.</returns>
        Task<PaginatedList<ServiceResourceFE>> SearchScopes(string languageCode, PaginatedSearchParams searchParams, CancellationToken cancellationToken = default);

        /// <summary>
        /// Performs a delegation check for a Maskinporten scope resource from a consumer party.
        /// </summary>
        /// <param name="party">The consumer party uuid.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="languageCode">The language code.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The resource delegation check.</returns>
        Task<ResourceCheckDto> ResourceDelegationCheck(Guid party, string resource, string languageCode, CancellationToken cancellationToken = default);

        /// <summary>
        /// Delegates a Maskinporten scope resource from a consumer party to a supplier.
        /// </summary>
        /// <param name="party">The consumer party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Whether the resource was delegated.</returns>
        Task<bool> AddSupplierResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets Maskinporten scope resources delegated from a consumer party to suppliers.
        /// </summary>
        /// <param name="languageCode">The language code.</param>
        /// <param name="party">The consumer party uuid.</param>
        /// <param name="supplier">Optional supplier organization number.</param>
        /// <param name="resource">Optional resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of delegated resources.</returns>
        Task<List<ResourceDelegation>> GetSupplierResources(string languageCode, Guid party, string supplier = null, string resource = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes a Maskinporten scope resource delegated from a consumer party to a supplier.
        /// </summary>
        /// <param name="party">The consumer party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveSupplierResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds a Maskinporten supplier for a consumer party.
        /// </summary>
        /// <param name="party">The consumer party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>The created assignment.</returns>
        Task<AssignmentDto> AddSupplier(Guid party, string supplier, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets Maskinporten consumers for a supplier party, optionally filtered to a single consumer by org number.
        /// </summary>
        /// <param name="party">The supplier party uuid.</param>
        /// <param name="consumer">Optional consumer org number to filter by.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of consumers.</returns>
        Task<IEnumerable<MaskinportenConnection>> GetConsumers(Guid party, string consumer = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes a Maskinporten supplier from a consumer party.
        /// </summary>
        /// <param name="party">The consumer party uuid.</param>
        /// <param name="supplier">The supplier organization number.</param>
        /// <param name="cascade">Whether to also remove resources delegated to the supplier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveSupplier(Guid party, string supplier, bool cascade = false, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes a Maskinporten consumer connection (supplier relinquishes access).
        /// </summary>
        /// <param name="party">The party uuid (the supplier).</param>
        /// <param name="consumer">The consumer organization number.</param>
        /// <param name="cascade">Whether to also remove resources received from the consumer.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveConsumer(Guid party, string consumer, bool cascade = false, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets Maskinporten scope resources delegated from consumers to the supplier party.
        /// </summary>
        /// <param name="languageCode">The language code.</param>
        /// <param name="party">The party uuid (the supplier).</param>
        /// <param name="consumer">Optional consumer organization number.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A collection of resources received by the supplier.</returns>
        Task<List<ResourceDelegation>> GetConsumerResources(string languageCode, Guid party, string consumer = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes a Maskinporten scope resource received by the supplier from a consumer.
        /// </summary>
        /// <param name="party">The party uuid (the supplier).</param>
        /// <param name="consumer">The consumer organization number.</param>
        /// <param name="resource">The resource identifier.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveConsumerResource(Guid party, string consumer, string resource, CancellationToken cancellationToken = default);
    }
}
