using System;
using System.Collections.Generic;
using System.Linq;
using Altinn.AMUI.Core.ClientInterfaces;
using Altinn.AMUI.Core.Configuration;
using Altinn.AMUI.Core.Helpers;
using Altinn.AMUI.Core.Models.AccessPackage;
using Altinn.AMUI.Core.Models.AccessPackage.Frontend;
using Altinn.AMUI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AMUI.Core.Models.Role;
using Altinn.AMUI.Core.Models.Role.Frontend;
using Altinn.AMUI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using RoleMetadata = Altinn.AMUI.Core.Models.Common.Role;

namespace Altinn.AMUI.Core.Services
{
    /// <inheritdoc />
    public class RoleService : IRoleService
    {
        private readonly IRoleClient _roleClient;
        private readonly IMemoryCache _memoryCache;
        private readonly CacheConfig _cacheConfig;
        private readonly ResourceHelper _resourceHelper;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleService"/> class.
        /// </summary>
        /// <param name="roleClient">The role client.</param>
        /// <param name="memoryCache">The memory cache.</param>
        /// <param name="cacheConfig">Cache configuration.</param>
        /// <param name="resourceHelper">The resource helper, used to map role and package resources.</param>
        public RoleService(
            IRoleClient roleClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig,
            ResourceHelper resourceHelper)
        {
            _roleClient = roleClient;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
            _resourceHelper = resourceHelper;
        }

        /// <inheritdoc />
        public async Task<List<RolePermissionFE>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode, CancellationToken cancellationToken = default)
        {
            var paginated = await _roleClient.GetRolePermissions(party, from, to, languageCode, cancellationToken);
            return paginated?.Items?.Select(RolePermissionFE.FromRolePermission).ToList() ?? new List<RolePermissionFE>();
        }

        /// <inheritdoc />
        public async Task<IEnumerable<RoleMetadata>> GetAllRoles(string languageCode, CancellationToken cancellationToken = default)
        {
            string cacheKey = $"allroles-{languageCode}";

            if (_memoryCache.TryGetValue(cacheKey, out IEnumerable<RoleMetadata> cachedRoles))
            {
                return cachedRoles;
            }

            IEnumerable<RoleMetadata> roles = await _roleClient.GetAllRoles(languageCode, cancellationToken);

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
        public async Task<IEnumerable<AccessPackageFE>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode, CancellationToken cancellationToken = default)
        {
            IEnumerable<AccessPackage> packages = await _roleClient.GetRolePackages(roleCode, variant, includeResources, languageCode, cancellationToken);
            return await _resourceHelper.MapToAccessPackagesFE(packages);
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ServiceResourceFE>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode, CancellationToken cancellationToken = default)
        {
            IEnumerable<ResourceAM> resources = await _roleClient.GetRoleResources(roleCode, variant, includePackageResources, languageCode, cancellationToken);
            List<ServiceResourceFE> resourcesFE = await _resourceHelper.MapToServiceResourcesFE(resources);
            return resourcesFE
                .Where(resource => resource.Identifier != null)
                .DistinctBy(resource => resource.Identifier)
                .ToList();
        }

        /// <inheritdoc />
        public Task RemoveRole(Guid party, Guid from, Guid to, string roleCode, CancellationToken cancellationToken = default)
            => _roleClient.RemoveRole(party, from, to, roleCode, cancellationToken);
    }
}
