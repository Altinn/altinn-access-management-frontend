using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend;

namespace Altinn.AccessManagement.UI.Core.Helpers
{
    /// <summary>
    /// Helper class for mapping resource ids to <see cref="ServiceResourceFE"/>
    /// </summary>
    public class ResourceHelper
    {
        private readonly IResourceRegistryClient _resourceRegistryClient;

        private readonly IAccessPackageClient _accessPackageClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="ResourceHelper"/> class.
        /// </summary>
        /// <param name="resourceRegistryClient">Resource registry client</param>
        /// <param name="accessPackageClient">Access package API client</param>
        public ResourceHelper(IResourceRegistryClient resourceRegistryClient, IAccessPackageClient accessPackageClient)
        {
            _resourceRegistryClient = resourceRegistryClient;
            _accessPackageClient = accessPackageClient;
        }

        /// <summary>
        /// Maps a list of resource ids to list of <see cref="ServiceResourceFE"/>
        /// </summary>
        /// <param name="resourceIds">List of resource ids to map</param>
        /// <param name="languageCode">Language code</param>
        public async Task<List<ServiceResourceFE>> EnrichResources(IEnumerable<string> resourceIds, string languageCode)
        {
            List<ServiceResourceFE> resourcesFE = [];

            if (resourceIds.Any())
            {
                // GET resources
                IEnumerable<Task<ServiceResource>> resourceTasks = resourceIds.Select(resourceId => _resourceRegistryClient.GetResource(resourceId));

                List<ServiceResource> resources = [];
                try
                {
                    await Task.WhenAll(resourceTasks.Select(async task =>
                    {
                        await task;
                        if (task.Result != null)
                        {
                            resources.Add(task.Result);
                        }
                    }));
                }
                catch
                {
                    // if loading a resource fails, the exception is caught and logged in _resourceRegistryClient.GetResource(resourceId)
                }

                OrgList orgList = await _resourceRegistryClient.GetAllResourceOwners();
                resourcesFE = ResourceUtils.MapToServiceResourcesFE(languageCode, resources, orgList);
            }

            return resourcesFE;
        }

        /// <summary>
        /// Maps a list of access packages ids to list of <see cref="AccessPackageFE"/>
        /// </summary>
        /// <param name="accessPackageIds">List of access package ids to map</param>
        /// <param name="languageCode">Language code</param>
        /// <param name="isHardcodedAccessPackage">Whether to use the agent delegation access packages or not</param>
        public async Task<List<AccessPackageFE>> EnrichAccessPackages(IEnumerable<string> accessPackageIds, string languageCode, bool isHardcodedAccessPackage)
        {
            List<AccessPackageFE> accessPackagesFE = [];

            if (accessPackageIds.Any())
            {
                List<AccessPackage> accessPackages;
                if (isHardcodedAccessPackage)
                {
                    List<string> agentDelegationMockAccessPackages = [
                        "urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet",
                        "urn:altinn:accesspackage:regnskapsforer-uten-signeringsrettighet",
                        "urn:altinn:accesspackage:regnskapsforer-lonn",
                        "urn:altinn:accesspackage:ansvarlig-revisor",
                        "urn:altinn:accesspackage:revisormedarbeider",
                        "urn:altinn:accesspackage:skattegrunnlag"
                    ];
                    accessPackages = agentDelegationMockAccessPackages.Select(urn =>
                    {
                        return new AccessPackage()
                        {
                            Id = new Guid("b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1"),
                            Urn = urn,
                            Area = null,
                            Description = string.Empty,
                            Name = string.Empty,
                            Resources = []
                        };
                    }).ToList();
                }
                else
                {
                    var accessPackageSearchMatches = await _accessPackageClient.GetAccessPackageSearchMatches(languageCode, string.Empty);
                    accessPackages = accessPackageSearchMatches.Select(x => x.Object).ToList();
                }

                List<AccessPackage> usedAccessPackages = accessPackages.Where(package => accessPackageIds.Contains(package.Urn)).ToList();

                foreach (AccessPackage accessPackage in usedAccessPackages)
                {
                    accessPackagesFE.Add(new AccessPackageFE()
                    {
                        Id = accessPackage.Id.ToString(),
                        Urn = accessPackage.Urn,
                        Description = accessPackage.Description,
                        Name = accessPackage.Name,
                        Resources = await EnrichResources(accessPackage.Resources.Select(x => x.Id.ToString()), languageCode)
                    });
                }
            }

            return accessPackagesFE;
        }

        /// <summary>
        /// Maps a list of rights to lists of <see cref="ServiceResourceFE"/> and <see cref="AccessPackageFE"/>
        /// </summary>
        /// <param name="rights">List of rights</param>
        /// <param name="accessPackages">List of access packages</param>
        /// <param name="languageCode">Language code</param>
        /// <param name="isHardcodedAccessPackage">Whether to use the agent delegation access packages or not</param>
        public async Task<RegisteredSystemRightsFE> MapRightsToFrontendObjects(IEnumerable<Right> rights, IEnumerable<RegisteredSystemAccessPackage> accessPackages, string languageCode, bool isHardcodedAccessPackage)
        {
            List<string> resourceIds = ResourceUtils.GetResourceIdsFromRights(rights);
            List<string> accessPackageIds = ResourceUtils.GetAccessPackageIdsFromRights(accessPackages);

            return new()
            {
                Resources = await EnrichResources(resourceIds, languageCode),
                AccessPackages = await EnrichAccessPackages(accessPackageIds, languageCode, isHardcodedAccessPackage),
            };
        }
    }
}