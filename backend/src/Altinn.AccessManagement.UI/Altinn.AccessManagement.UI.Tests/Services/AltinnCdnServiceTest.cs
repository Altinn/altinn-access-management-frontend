using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Services
{
    /// <summary>
    /// Tests that <see cref="AltinnCdnService"/> caches organization data, and that a CDN outage
    /// degrades to the last successfully fetched data instead of an empty result, without retrying
    /// on every request.
    /// </summary>
    public class AltinnCdnServiceTest
    {
        private const string CacheKey = "CdnOrgDataDictionary";

        private static readonly Dictionary<string, OrgData> OrgData = new(StringComparer.OrdinalIgnoreCase)
        {
            {
                "skd",
                new OrgData
                {
                    Name = new Dictionary<string, string> { { "nb", "Skatteetaten" } },
                    Logo = "https://altinncdn.no/orgs/skd/skd.png",
                    Emblem = "https://altinncdn.no/orgs/skd/skd.svg",
                }
            },
        };

        private readonly MemoryCache _cache = new(new MemoryCacheOptions());
        private readonly Mock<IAltinnCdnClient> _client = new();

        private AltinnCdnService Service => new(_client.Object, _cache, NullLogger<AltinnCdnService>.Instance);

        /// <summary>
        /// Test case: Organization data is requested repeatedly.
        /// Expected: The CDN is only called once, and every caller gets live data.
        /// </summary>
        [Fact]
        public async Task GetOrgDataSnapshot_CachesFetchedData()
        {
            _client.Setup(c => c.GetOrgData()).ReturnsAsync(OrgData);
            AltinnCdnService service = Service;

            OrgDataSnapshot first = await service.GetOrgDataSnapshot();
            OrgDataSnapshot second = await service.GetOrgDataSnapshot();

            Assert.Equal(OrgDataAvailability.Live, first.Availability);
            Assert.Equal(OrgDataAvailability.Live, second.Availability);
            Assert.Equal(OrgData, second.Data);
            _client.Verify(c => c.GetOrgData(), Times.Once);
        }

        /// <summary>
        /// Test case: The CDN becomes unreachable after a successful fetch and the cached entry expires.
        /// Expected: The last successfully fetched data is served, marked as stale.
        /// </summary>
        [Fact]
        public async Task GetOrgDataSnapshot_CdnUnreachableAfterSuccess_ServesLastKnownGood()
        {
            _client.Setup(c => c.GetOrgData()).ReturnsAsync(OrgData);
            AltinnCdnService service = Service;
            await service.GetOrgDataSnapshot();

            // Simulate the cached entry expiring, then the CDN going down.
            _cache.Remove(CacheKey);
            _client.Setup(c => c.GetOrgData()).ThrowsAsync(new HttpRequestException("CDN is down"));

            OrgDataSnapshot snapshot = await service.GetOrgDataSnapshot();

            Assert.Equal(OrgDataAvailability.Stale, snapshot.Availability);
            Assert.Equal(OrgData, snapshot.Data);
        }

        /// <summary>
        /// Test case: The CDN is unreachable and has never been reached successfully.
        /// Expected: An empty result marked unavailable, so callers can tell it apart from "no orgs".
        /// </summary>
        [Fact]
        public async Task GetOrgDataSnapshot_CdnUnreachableWithNoPriorSuccess_ReportsUnavailable()
        {
            _client.Setup(c => c.GetOrgData()).ThrowsAsync(new HttpRequestException("CDN is down"));

            OrgDataSnapshot snapshot = await Service.GetOrgDataSnapshot();

            Assert.Equal(OrgDataAvailability.Unavailable, snapshot.Availability);
            Assert.Empty(snapshot.Data);
        }

        /// <summary>
        /// Test case: The CDN is unreachable and several requests arrive in quick succession.
        /// Expected: Only the first request reaches the CDN — an outage must not turn every incoming
        /// request into another outbound one.
        /// </summary>
        [Fact]
        public async Task GetOrgDataSnapshot_CdnUnreachable_DoesNotRetryOnEveryRequest()
        {
            _client.Setup(c => c.GetOrgData()).ThrowsAsync(new HttpRequestException("CDN is down"));
            AltinnCdnService service = Service;

            await service.GetOrgDataSnapshot();
            await service.GetOrgDataSnapshot();
            await service.GetOrgDataSnapshot();

            _client.Verify(c => c.GetOrgData(), Times.Once);
        }

        /// <summary>
        /// Test case: A CDN failure is followed by the CDN recovering, after the backoff has passed.
        /// Expected: The service fetches again and serves live data.
        /// </summary>
        [Fact]
        public async Task GetOrgDataSnapshot_CdnRecovers_ServesLiveDataAgain()
        {
            _client.Setup(c => c.GetOrgData()).ThrowsAsync(new HttpRequestException("CDN is down"));
            AltinnCdnService service = Service;
            await service.GetOrgDataSnapshot();

            // Simulate the failure backoff elapsing.
            _cache.Remove("CdnOrgDataDictionary:FetchFailed");
            _client.Setup(c => c.GetOrgData()).ReturnsAsync(OrgData);

            OrgDataSnapshot snapshot = await service.GetOrgDataSnapshot();

            Assert.Equal(OrgDataAvailability.Live, snapshot.Availability);
            Assert.Equal(OrgData, snapshot.Data);
        }

        /// <summary>
        /// Test case: Organization data is requested through the dictionary-returning overload.
        /// Expected: It returns the same data as the snapshot overload.
        /// </summary>
        [Fact]
        public async Task GetOrgData_ReturnsSnapshotData()
        {
            _client.Setup(c => c.GetOrgData()).ReturnsAsync(OrgData);

            Dictionary<string, OrgData> orgData = await Service.GetOrgData();

            Assert.Equal(OrgData, orgData);
        }
    }
}
