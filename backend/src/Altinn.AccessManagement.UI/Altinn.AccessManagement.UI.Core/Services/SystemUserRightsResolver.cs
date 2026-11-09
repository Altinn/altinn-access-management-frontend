using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Configuration;
using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Models.Common.Frontend;
using Altinn.AccessManagement.UI.Core.Models.SystemUser;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class SystemUserRightsResolver : ISystemUserRightsResolver
    {
        private const string StandardUserType = "standard";

        private readonly ISystemUserClient _systemUserClient;
        private readonly IRegisterClient _registerClient;
        private readonly IMemoryCache _memoryCache;
        private readonly CacheConfig _cacheConfig;
        private readonly ILogger<SystemUserRightsResolver> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="SystemUserRightsResolver"/> class.
        /// </summary>
        /// <param name="systemUserClient">The system user client.</param>
        /// <param name="registerClient">The register client.</param>
        /// <param name="memoryCache">The memory cache.</param>
        /// <param name="cacheConfig">Cache configuration.</param>
        /// <param name="logger">The logger.</param>
        public SystemUserRightsResolver(
            ISystemUserClient systemUserClient,
            IRegisterClient registerClient,
            IMemoryCache memoryCache,
            IOptions<CacheConfig> cacheConfig,
            ILogger<SystemUserRightsResolver> logger)
        {
            _systemUserClient = systemUserClient;
            _registerClient = registerClient;
            _memoryCache = memoryCache;
            _cacheConfig = cacheConfig.Value;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task ApplyVendorFixedRights(Guid actingPartyUuid, IEnumerable<PartyFE> parties, CancellationToken cancellationToken = default)
        {
            List<PartyFE> systemUsers = parties?
                .Where(p => p != null && p.Type == PartyTypeFE.SystemUser)
                .ToList() ?? [];

            if (systemUsers.Count == 0)
            {
                return;
            }

            int? ownerPartyId = await GetPartyId(actingPartyUuid);
            if (!ownerPartyId.HasValue)
            {
                _logger.LogWarning("Could not resolve party id for {PartyUuid}; system users are not resolved", actingPartyUuid);
                return;
            }

            Guid[] ids = systemUsers.Select(p => p.Id).Distinct().ToArray();
            bool[] vendorFixed = await Task.WhenAll(ids.Select(id => IsVendorFixed(ownerPartyId.Value, id, cancellationToken)));
            Dictionary<Guid, bool> vendorFixedById = ids.Zip(vendorFixed).ToDictionary(x => x.First, x => x.Second);

            foreach (PartyFE party in systemUsers)
            {
                party.IsVendorFixedRights = vendorFixedById[party.Id];
            }
        }

        private async Task<int?> GetPartyId(Guid partyUuid)
        {
            string cacheKey = $"partyid-{partyUuid}";
            if (_memoryCache.TryGetValue(cacheKey, out int cachedPartyId))
            {
                return cachedPartyId;
            }

            try
            {
                Altinn.Register.Contracts.Party party = await _registerClient.GetParty(partyUuid);
                if (party?.PartyId.HasValue != true)
                {
                    return null;
                }

                int partyId = (int)party.PartyId.Value;
                _memoryCache.Set(cacheKey, partyId, TimeSpan.FromMinutes(_cacheConfig.PartyCacheTimeout));
                return partyId;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed looking up party {PartyUuid}", partyUuid);
                return null;
            }
        }

        private async Task<bool> IsVendorFixed(int ownerPartyId, Guid systemUserId, CancellationToken cancellationToken)
        {
            string cacheKey = $"systemuser-vendorfixedrights-{systemUserId}";
            if (_memoryCache.TryGetValue(cacheKey, out bool cachedVendorFixed))
            {
                return cachedVendorFixed;
            }

            try
            {
                SystemUser systemUser = await _systemUserClient.GetSpecificSystemUser(ownerPartyId, systemUserId, cancellationToken);
                if (systemUser == null)
                {
                    // Not owned by the acting party (e.g. a client's view of an agent system user), or not found
                    return false;
                }

                bool vendorFixed = string.Equals(systemUser.UserType, StandardUserType, StringComparison.OrdinalIgnoreCase);
                _memoryCache.Set(cacheKey, vendorFixed, TimeSpan.FromMinutes(_cacheConfig.PartyCacheTimeout));
                return vendorFixed;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed looking up system user {SystemUserId}", systemUserId);
                return false;
            }
        }
    }
}
