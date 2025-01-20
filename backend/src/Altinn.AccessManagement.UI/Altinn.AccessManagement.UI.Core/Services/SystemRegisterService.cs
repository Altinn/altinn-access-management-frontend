using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemRegisterService : ISystemRegisterService
    {
        private readonly ISystemRegisterClient _systemRegisterClient;
        private readonly IRegisterClient _registerClient;
        private readonly IResourceRegistryClient _resourceRegistryClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemRegisterService"/> class.
        /// </summary>
        /// <param name="systemRegisterClient">The system register client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="resourceRegistryClient">The resource registry client.</param>
        public SystemRegisterService(
            ISystemRegisterClient systemRegisterClient,
            IRegisterClient registerClient,
            IResourceRegistryClient resourceRegistryClient)
        {
            _systemRegisterClient = systemRegisterClient;
            _registerClient = registerClient;
            _resourceRegistryClient = resourceRegistryClient;
        }

        /// <inheritdoc />
        public async Task<List<RegisteredSystemFE>> GetSystems(string languageCode, CancellationToken cancellationToken)
        {
            List<RegisteredSystem> lista = await _systemRegisterClient.GetSystems(cancellationToken);
            IEnumerable<RegisteredSystem> visibleSystems = lista.Where(system => system.IsVisible);

            IEnumerable<string> orgNumbers = visibleSystems.Select(x => x.SystemVendorOrgNumber);
            var orgNames = await _registerClient.GetPartyNames(orgNumbers, cancellationToken);

            return visibleSystems.Select(system => new RegisteredSystemFE
            {
                SystemId = system.SystemId,
                SystemName = system.Name[languageCode],
                SystemVendorOrgNumber = system.SystemVendorOrgNumber,
                SystemVendorOrgName = orgNames.Find(x => x.OrgNo == system.SystemVendorOrgNumber)?.Name ?? "N/A"
            }).ToList();
        }

        /// <inheritdoc />
        public async Task<List<ServiceResourceFE>> GetSystemRights(string languageCode, string systemId, CancellationToken cancellationToken)
        {
            List<Right> rights = await _systemRegisterClient.GetRightsFromSystem(systemId, cancellationToken);
            List<string> resourceIds = ResourceUtils.GetResourceIdsFromRights(rights);

            IEnumerable<Task<ServiceResource>> resourceTasks = resourceIds.Select(resourceId => _resourceRegistryClient.GetResource(resourceId));
            IEnumerable<ServiceResource> resources = await Task.WhenAll(resourceTasks);

            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();
        
            return ResourceUtils.MapToServiceResourcesFE(languageCode, resources, orgList);
        }
    }
}