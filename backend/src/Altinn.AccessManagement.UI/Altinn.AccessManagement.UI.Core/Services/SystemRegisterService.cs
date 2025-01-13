using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
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
        public async Task<List<RegisteredSystem>> GetSystems(CancellationToken cancellationToken)
        {
            List<RegisteredSystem> lista = await _systemRegisterClient.GetSystems(cancellationToken);
            IEnumerable<RegisteredSystem> visibleSystems = lista.Where(system => system.IsVisible);

            IEnumerable<string> orgNumbers = visibleSystems.Select(x => x.SystemVendorOrgNumber);
            var orgNames = await _registerClient.GetPartyNames(orgNumbers, cancellationToken);
            foreach (RegisteredSystem system in visibleSystems)
            {
                try
                {
                    system.SystemVendorOrgName = orgNames.Find(x => x.OrgNo == system.SystemVendorOrgNumber)?.Name ?? "N/A";
                }
                catch (Exception ex)
                {
                    system.SystemVendorOrgName = "N/A"; // "N/A" stands for "Not Available
                    Console.Write(ex.ToString());
                }
            }

            return visibleSystems.ToList();
        }

        /// <inheritdoc />
        public async Task<List<ServiceResourceFE>> GetSystemRights(string languageCode, string systemId, CancellationToken cancellationToken)
        {
            List<Right> rights = await _systemRegisterClient.GetRightsFromSystem(systemId, cancellationToken);
            List<string> resourceIds = GetResourceIdsFromRights(rights);

            IEnumerable<Task<ServiceResource>> resourceTasks = resourceIds.Select(resourceId => _resourceRegistryClient.GetResource(resourceId));
            IEnumerable<ServiceResource> resources = await Task.WhenAll(resourceTasks);

            OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();
        
            return ResourceUtils.MapToServiceResourcesFE(languageCode, resources, orgList);
        }
        
        private static List<string> GetResourceIdsFromRights(IEnumerable<Right> rights)
        {
            List<string> resourceIds = new List<string>();
            foreach (Right right in rights)
            {
                string resourceId = right.Resource.Find(x => x.Id == "urn:altinn:resource")?.Value;
                if (resourceId != null)
                {
                    resourceIds.Add(resourceId);
                }
            }

            return resourceIds;
        }
    }
}
