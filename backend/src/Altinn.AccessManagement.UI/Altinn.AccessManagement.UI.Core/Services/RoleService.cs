using System;
using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.Role.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class RoleService : IRoleService
    {
        private readonly IRoleClient _roleClient;
        private readonly IMemoryCache _memoryCache;
        private readonly CacheConfig _cacheConfig;
        private readonly IResourceService _resourceService;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleService"/> class.
        /// </summary>
        /// <param name="roleClient">The role client.</param>
        /// <param name="memoryCache">The memory cache.</param>
        /// <param name="cacheConfig">Cache configuration.</param>
        /// <param name="resourceService">The resource service, used to enrich role resources.</param>
        /// <param name="resourceHelper">The resource helper, used to enrich package resources.</param>
        public RoleService(
            IRoleClient roleClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig,
            IResourceService resourceService,
            ResourceHelper resourceHelper)
        {
            _roleClient = roleClient;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
            _resourceService = resourceService;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<List<RolePermissionFE>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode)
        {
            var paginated = await _roleClient.GetRolePermissions(party, from, to, languageCode);
            return paginated?.Items?.Select(RolePermissionFE.FromRolePermission).ToList() ?? new List<RolePermissionFE>();
        }

        /// <inheritdoc />
        public async Task<IEnumerable<RoleMetadata>> GetAllRoles(string languageCode)
        {
            string cacheKey = $"allroles-{languageCode}";

            if (_memoryCache.TryGetValue(cacheKey, out IEnumerable<RoleMetadata> cachedRoles))
            {
                return cachedRoles;
            }

            IEnumerable<RoleMetadata> roles = await _roleClient.GetAllRoles(languageCode);

            if (roles != null)
            {
                MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetPriority(CacheItemPriority.Normal)
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(_cacheConfig.ResourceRegistryResourceCacheTimeout));

                _memoryCache.Set(cacheKey, roles, cacheEntryOptions);
            }

            return roles;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<AccessPackageFE>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode)
        {
            IEnumerable<AccessPackage> packages = await _roleClient.GetRolePackages(roleCode, variant, includeResources, languageCode);
            return await _resourceHelper.MapToAccessPackagesFE(packages, languageCode);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ServiceResourceFE>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode)
        {
            List<ResourceAM> resources = (await _roleClient.GetRoleResources(roleCode, variant, includePackageResources, languageCode))?.ToList() ?? [];
            Dictionary<string, ServiceResourceFE> resourcesByRefId = await _resourceService.GetResourcesFE(resources, languageCode);
            return resources
                .Where(resource => resource?.RefId != null && resourcesByRefId.ContainsKey(resource.RefId))
                .Select(resource => resourcesByRefId[resource.RefId])
                .DistinctBy(resource => resource.Identifier)
                .ToList();
        }

        /// <inheritdoc />
        public Task RemoveRole(Guid party, Guid from, Guid to, string roleCode)
            => _roleClient.RemoveRole(party, from, to, roleCode);
    }
}
