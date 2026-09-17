using System;
using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
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
        private readonly IAltinnCdnService _altinnCdnService;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleService"/> class.
        /// </summary>
        /// <param name="roleClient">The role client.</param>
        /// <param name="memoryCache">The memory cache.</param>
        /// <param name="cacheConfig">Cache configuration.</param>
        /// <param name="altinnCdnService">Altinn CDN service. Provides the service owner logos</param>
        public RoleService(
            IRoleClient roleClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig,
            IAltinnCdnService altinnCdnService)
        {
            _roleClient = roleClient;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
            _altinnCdnService = altinnCdnService;
        }

        /// <inheritdoc />
        public async Task<List<RolePermission>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode)
        {
            var paginated = await _roleClient.GetRolePermissions(party, from, to, languageCode);
            return paginated?.Items?.ToList() ?? new List<RolePermission>();
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
        public async Task<IEnumerable<AccessPackage>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode)
        {
            IEnumerable<AccessPackage> packages = await _roleClient.GetRolePackages(roleCode, variant, includeResources, languageCode);

            await _altinnCdnService.ApplyOwnerLogos(packages);

            return packages;
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ResourceAM>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode)
        {
            IEnumerable<ResourceAM> resources = await _roleClient.GetRoleResources(roleCode, variant, includePackageResources, languageCode);

            await _altinnCdnService.ApplyOwnerLogos(resources);

            return resources;
        }

        /// <inheritdoc />
        public Task RemoveRole(Guid party, Guid from, Guid to, string roleCode)
            => _roleClient.RemoveRole(party, from, to, roleCode);
    }
}
