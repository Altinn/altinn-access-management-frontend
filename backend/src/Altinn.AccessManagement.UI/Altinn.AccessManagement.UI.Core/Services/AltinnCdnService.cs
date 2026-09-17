#nullable enable

using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service for retrieving and caching organization data from the Altinn CDN.
    /// </summary>
    /// <remarks>
    /// Organization data is near-static, and it decorates responses across most of the API (service
    /// owner names and logos). A CDN outage must therefore degrade gently: the last successfully
    /// fetched data is kept indefinitely and served while the CDN is unreachable, and failures are
    /// cached briefly so an outage cannot turn every incoming request into another outbound one.
    /// </remarks>
    public class AltinnCdnService : IAltinnCdnService
    {
        private const string CacheKey = "CdnOrgDataDictionary";
        private const string LastKnownGoodCacheKey = "CdnOrgDataDictionary:LastKnownGood";
        private const string FetchFailedCacheKey = "CdnOrgDataDictionary:FetchFailed";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);
        private static readonly TimeSpan FailureBackoff = TimeSpan.FromSeconds(30);

        private readonly IMemoryCache _cache;
        private readonly ILogger<AltinnCdnService> _logger;
        private readonly IAltinnCdnClient _altinnCdnClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnService"/> class.
        /// </summary>
        /// <param name="altinnCdnClient">The client used to fetch organization data from Altinn CDN.</param>
        /// <param name="cache">The memory cache for storing organization data.</param>
        /// <param name="logger">The logger instance for logging errors and information.</param>
        public AltinnCdnService(IAltinnCdnClient altinnCdnClient, IMemoryCache cache, ILogger<AltinnCdnService> logger)
        {
            _altinnCdnClient = altinnCdnClient;
            _cache = cache;
            _logger = logger;
        }

        /// <inheritdoc/>
        public async Task<Dictionary<string, OrgData>> GetOrgData()
        {
            OrgDataSnapshot snapshot = await GetOrgDataSnapshot();
            return snapshot.Data;
        }

        /// <inheritdoc/>
        public async Task<OrgDataSnapshot> GetOrgDataSnapshot()
        {
            if (_cache.TryGetValue(CacheKey, out Dictionary<string, OrgData>? cachedOrgData) && cachedOrgData != null)
            {
                return new OrgDataSnapshot(cachedOrgData, OrgDataAvailability.Live);
            }

            // A recent fetch failed. Don't retry on every request while the CDN is down.
            if (_cache.TryGetValue(FetchFailedCacheKey, out bool _))
            {
                return LastKnownGood();
            }

            try
            {
                Dictionary<string, OrgData> orgData = await _altinnCdnClient.GetOrgData();

                _cache.Set(CacheKey, orgData, new MemoryCacheEntryOptions().SetAbsoluteExpiration(CacheDuration));

                // Kept without expiry so it can carry us through a CDN outage that outlasts the cache.
                _cache.Set(LastKnownGoodCacheKey, orgData, new MemoryCacheEntryOptions { Priority = CacheItemPriority.NeverRemove });

                return new OrgDataSnapshot(orgData, OrgDataAvailability.Live);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving organization data from Altinn CDN.");
                _cache.Set(FetchFailedCacheKey, true, new MemoryCacheEntryOptions().SetAbsoluteExpiration(FailureBackoff));
                return LastKnownGood();
            }
        }

        /// <inheritdoc/>
        public async Task ApplyOwnerLogos(IEnumerable<ResourceAM> resources)
        {
            if (resources == null)
            {
                return;
            }

            Dictionary<string, OrgData> orgs = await GetOrgData();
            foreach (ResourceAM resource in resources)
            {
                if (resource?.Provider != null)
                {
                    resource.Provider.LogoUrl = ResourceUtils.ResolveOwnerLogoUrl(orgs, resource.Provider.Code);
                }
            }
        }

        /// <inheritdoc/>
        public async Task ApplyOwnerLogos(IEnumerable<AccessPackageAM> packages)
        {
            if (packages == null)
            {
                return;
            }

            // Resolved once for all packages; GetOrgData is cached, but the loop below should not
            // depend on that.
            Dictionary<string, OrgData> orgs = await GetOrgData();
            foreach (AccessPackageAM package in packages)
            {
                foreach (ResourceAM resource in package?.Resources ?? [])
                {
                    if (resource?.Provider != null)
                    {
                        resource.Provider.LogoUrl = ResourceUtils.ResolveOwnerLogoUrl(orgs, resource.Provider.Code);
                    }
                }
            }
        }

        private OrgDataSnapshot LastKnownGood()
        {
            if (_cache.TryGetValue(LastKnownGoodCacheKey, out Dictionary<string, OrgData>? lastKnownGood) && lastKnownGood != null)
            {
                return new OrgDataSnapshot(lastKnownGood, OrgDataAvailability.Stale);
            }

            return new OrgDataSnapshot(new Dictionary<string, OrgData>(StringComparer.OrdinalIgnoreCase), OrgDataAvailability.Unavailable);
        }
    }
}
