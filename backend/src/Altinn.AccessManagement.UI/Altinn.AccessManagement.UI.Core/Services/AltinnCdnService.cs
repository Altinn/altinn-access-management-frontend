using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <summary>
    /// Service for retrieving and caching organization logo mappings from a remote JSON source.
    /// </summary>
    public class AltinnCdnService : IAltinnCdnService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AltinnCdnService> _logger;
        private readonly IAltinnCdnClient _altinnCdnClient;

        private const string CacheKey = "CdnOrgDataDictionary";
        private readonly TimeSpan cacheDuration = TimeSpan.FromHours(1);
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        /// <summary>
        /// Initializes a new instance of the <see cref="AltinnCdnService"/> class.
        /// </summary>
        /// <param name="altinnCdnClient">The client used to fetch organization data from Altinn CDN.</param>
        /// <param name="httpClient">The HTTP client used to fetch organization logo data.</param>
        /// <param name="cache">The memory cache for storing logo mappings.</param>
        /// <param name="logger">The logger instance for logging errors and information.</param>
        public AltinnCdnService(IAltinnCdnClient altinnCdnClient, HttpClient httpClient, IMemoryCache cache, ILogger<AltinnCdnService> logger)
        {
            _altinnCdnClient = altinnCdnClient;
            _httpClient = httpClient;
            _cache = cache;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves organization data from the Altinn CDN.
        /// Caches the result for a specified duration to improve performance.
        /// </summary>
        /// <returns>A dictionary containing organization data, where the key is the organization code and the value is the <see cref="OrgData"/> object.</returns>
        public async Task<Dictionary<string, OrgData>> GetOrgData()
        {
            try
            {
                if (_cache.TryGetValue(CacheKey, out Dictionary<string, OrgData> orgData) && orgData != null)
                {
                    return orgData;
                }
                else
                {
                    var cacheEntryOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(cacheDuration);

                    orgData = await _altinnCdnClient.GetOrgData();
                    _cache.Set(CacheKey, orgData, cacheEntryOptions);
                    return orgData;
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving organization data from Altinn CDN.");
                return new Dictionary<string, OrgData>();
            }
        }
    }
}