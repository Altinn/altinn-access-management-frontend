using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service that integrates with the Maskinporten administration API.
    /// </summary>
    public class MaskinportenService : IMaskinportenService
    {
        private readonly IMaskinportenClient _maskinportenClient;
        private readonly IResourceService _resourceService;

        /// <summary>
        /// Initializes a new instance of the <see cref="MaskinportenService"/> class.
        /// </summary>
        /// <param name="maskinportenClient">Maskinporten client.</param>
        /// <param name="resourceService">Resource service.</param>
        public MaskinportenService(IMaskinportenClient maskinportenClient, IResourceService resourceService)
        {
            _maskinportenClient = maskinportenClient;
            _resourceService = resourceService;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnectionFE>> GetSuppliers(Guid party, string supplier = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<MaskinportenConnection> suppliers = await _maskinportenClient.GetSuppliers(party, supplier, cancellationToken);
            return suppliers?.Select(MaskinportenConnectionFE.FromMaskinportenConnection).ToList();
        }

        /// <inheritdoc />
        public async Task<PaginatedList<ServiceResourceFE>> SearchScopes(string languageCode, PaginatedSearchParams searchParams, CancellationToken cancellationToken = default)
        {
            return await _resourceService.GetPaginatedSearchResults(languageCode, searchParams, new[] { ResourceType.MaskinportenSchema }, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<ResourceCheckDto> ResourceDelegationCheck(Guid party, string resource, string languageCode, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.ResourceDelegationCheck(party, resource, languageCode, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<bool> AddSupplierResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.AddSupplierResource(party, supplier, resource, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<List<ResourceDelegation>> GetSupplierResources(string languageCode, Guid party, string supplier = null, string resource = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<ResourcePermission> resourcePermissions = await _maskinportenClient.GetSupplierResources(party, languageCode, supplier, resource, cancellationToken);
            return await EnrichResourcePermissions(resourcePermissions, languageCode, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveSupplierResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default)
        {
            await _maskinportenClient.RemoveSupplierResource(party, supplier, resource, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<AssignmentDto> AddSupplier(Guid party, string supplier, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.AddSupplier(party, supplier, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<MaskinportenConnectionFE>> GetConsumers(Guid party, string consumer = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<MaskinportenConnection> consumers = await _maskinportenClient.GetConsumers(party, consumer, cancellationToken);
            return consumers?.Select(MaskinportenConnectionFE.FromMaskinportenConnection).ToList();
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

        /// <inheritdoc />
        public async Task<List<ResourceDelegation>> GetConsumerResources(string languageCode, Guid party, string consumer = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<ResourcePermission> resourcePermissions = await _maskinportenClient.GetConsumerResources(party, languageCode, consumer, cancellationToken);
            return await EnrichResourcePermissions(resourcePermissions, languageCode, cancellationToken);
        }

        /// <inheritdoc />
        public async Task RemoveConsumerResource(Guid party, string consumer, string resource, CancellationToken cancellationToken = default)
        {
            await _maskinportenClient.RemoveConsumerResource(party, consumer, resource, cancellationToken);
        }

        private async Task<List<ResourceDelegation>> EnrichResourcePermissions(IEnumerable<ResourcePermission> resourcePermissions, string languageCode, CancellationToken cancellationToken)
        {
            List<ResourcePermission> permissions = resourcePermissions?
                .Where(rp => !string.IsNullOrWhiteSpace(rp.Resource?.RefId))
                .ToList() ?? [];

            // Each resource is looked up once. Resources that cannot be found are left out.
            Dictionary<string, ServiceResourceFE> resources = await _resourceService.GetResourcesFE(
                permissions.Select(rp => rp.Resource.RefId),
                languageCode,
                cancellationToken);

            return permissions
                .Where(rp => resources.ContainsKey(rp.Resource.RefId))
                .Select(rp => new ResourceDelegation(resources[rp.Resource.RefId], PermissionFE.FromPermissions(rp.Permissions)))
                .ToList();
        }
    }
}
