using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.ClientDelegation;
using Altinn.AccessManagement.UI.Core.Models.Maskinporten;
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
        public async Task<IEnumerable<MaskinportenConnection>> GetSuppliers(Guid party, string supplier = null, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.GetSuppliers(party, supplier, cancellationToken);
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
        public async Task<bool> AddResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default)
        {
            return await _maskinportenClient.AddResource(party, supplier, resource, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<List<ResourceDelegation>> GetResources(string languageCode, Guid party, string supplier = null, string resource = null, CancellationToken cancellationToken = default)
        {
            IEnumerable<ResourcePermission> resourcePermissions = await _maskinportenClient.GetResources(party, supplier, resource, cancellationToken);
            List<ResourceDelegation> delegations = new List<ResourceDelegation>();

            foreach (ResourcePermission resourcePermission in resourcePermissions)
            {
                string resourceId = resourcePermission.Resource?.RefId;
                if (string.IsNullOrWhiteSpace(resourceId))
                {
                    continue;
                }

                ServiceResourceFE serviceResource = await _resourceService.GetResource(resourceId, languageCode);
                if (serviceResource != null)
                {
                    delegations.Add(new ResourceDelegation(serviceResource, resourcePermission.Permissions));
                }
            }

            return delegations;
        }

        /// <inheritdoc />
        public async Task RemoveResource(Guid party, string supplier, string resource, CancellationToken cancellationToken = default)
        {
            await _maskinportenClient.RemoveResource(party, supplier, resource, cancellationToken);
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
