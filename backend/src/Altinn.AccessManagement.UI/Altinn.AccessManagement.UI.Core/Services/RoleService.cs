using System;
using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;
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

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleService"/> class.
        /// </summary>
        /// <param name="roleClient">The role client.</param>
        /// <param name="memoryCache">The memory cache.</param>
        /// <param name="cacheConfig">Cache configuration.</param>
        public RoleService(
            IRoleClient roleClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig)
        {
            _roleClient = roleClient;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
        }

        /// <inheritdoc />
        public async Task<List<RolePermission>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode)
        {
            var paginated = await _roleClient.GetRolePermissions(party, from, to, languageCode);
            return paginated?.Items?.ToList() ?? new List<RolePermission>();
        }

        /// <inheritdoc />
        public Task<RoleMetadata> GetRoleById(Guid roleId, string languageCode) => _roleClient.GetRoleById(roleId, languageCode);

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
        public Task<IEnumerable<AccessPackage>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode)
            => _roleClient.GetRolePackages(roleCode, variant, includeResources, languageCode);

        /// <inheritdoc />
        public Task<IEnumerable<ResourceAM>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode)
            => _roleClient.GetRoleResources(roleCode, variant, includePackageResources, languageCode);
    }
}
