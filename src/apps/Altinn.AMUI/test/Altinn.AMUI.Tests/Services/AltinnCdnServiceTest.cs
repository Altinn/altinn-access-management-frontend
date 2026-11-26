using Altinn.AMUI.Core.ClientInterfaces;
using Altinn.AMUI.Core.Models.Common;
using Altinn.AMUI.Core.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace Altinn.AMUI.Tests.Services
{
    /// <summary>
    /// Tests for <see cref="AltinnCdnService"/>, which every resource enrichment path uses to resolve owner logos.
    /// </summary>
    public class AltinnCdnServiceTest
    {
        [Fact]
        public async Task GetOrgData_CachesDataAfterFirstRequest()
        {
            // Arrange
            Dictionary<string, OrgData> orgData = new()
            {
                ["cto"] = new OrgData { Logo = "https://altinncdn.no/orgs/cto/cto.png" },
            };
            Mock<IAltinnCdnClient> client = new();
            client.Setup(c => c.GetOrgData()).ReturnsAsync(orgData);
            AltinnCdnService service = new(client.Object, new MemoryCache(new MemoryCacheOptions()), NullLogger<AltinnCdnService>.Instance);

            // Act
            Dictionary<string, OrgData> first = await service.GetOrgData();
            Dictionary<string, OrgData> second = await service.GetOrgData();
            Dictionary<string, OrgData> third = await service.GetOrgData();

            // Assert
            Assert.Same(orgData, first);
            Assert.Same(orgData, second);
            Assert.Same(orgData, third);
            client.Verify(c => c.GetOrgData(), Times.Once);
        }

        [Fact]
        public async Task GetOrgData_WhenClientFails_ReturnsEmptyInsteadOfThrowing()
        {
            // Arrange
            Mock<IAltinnCdnClient> client = new();
            client.Setup(c => c.GetOrgData()).ThrowsAsync(new HttpRequestException("CDN unavailable"));
            AltinnCdnService service = new(client.Object, new MemoryCache(new MemoryCacheOptions()), NullLogger<AltinnCdnService>.Instance);

            // Act
            Dictionary<string, OrgData> result = await service.GetOrgData();

            // Assert: resources are still served, just without logos
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
