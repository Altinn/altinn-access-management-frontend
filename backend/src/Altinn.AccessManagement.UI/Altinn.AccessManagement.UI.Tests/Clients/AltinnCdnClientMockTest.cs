using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Mocks.Mocks;

namespace Altinn.AccessManagement.UI.Tests.Clients
{
    /// <summary>
    /// Tests the contract the rest of the code relies on when looking up organization data: org
    /// codes resolve regardless of casing, and the mock data matches the shape the real Altinn CDN
    /// serves. The mock previously used host-relative urls while production uses absolute ones,
    /// which hid a broken logo url behind passing tests.
    /// </summary>
    public class AltinnCdnClientMockTest
    {
        /// <summary>
        /// Test case: An org code is looked up in a casing that differs from the CDN's own keys.
        /// Expected: The org is found — resource metadata is not consistent about casing.
        /// </summary>
        [Fact]
        public async Task GetOrgData_LooksUpOrgCodesCaseInsensitively()
        {
            Dictionary<string, OrgData> orgData = await new AltinnCdnClientMock().GetOrgData();

            Assert.True(orgData.ContainsKey("skd"));
            Assert.True(orgData.ContainsKey("SKD"));
            Assert.True(orgData.ContainsKey("Skd"));
            Assert.Same(orgData["skd"], orgData["SKD"]);
        }

        /// <summary>
        /// Test case: The mock org data is served to callers that put the urls straight into an img tag.
        /// Expected: Every logo and emblem url is absolute, as the real CDN serves them.
        /// </summary>
        [Fact]
        public async Task GetOrgData_ServesAbsoluteImageUrls()
        {
            Dictionary<string, OrgData> orgData = await new AltinnCdnClientMock().GetOrgData();

            Assert.NotEmpty(orgData);
            foreach ((string code, OrgData org) in orgData)
            {
                if (!string.IsNullOrEmpty(org.Logo))
                {
                    Assert.StartsWith("https://", org.Logo);
                }

                if (!string.IsNullOrEmpty(org.Emblem))
                {
                    Assert.StartsWith("https://", org.Emblem);
                }
            }
        }

        /// <summary>
        /// Test case: The mock data is used to cover logo resolution.
        /// Expected: It keeps an org without an emblem and an org without any image at all, so the
        /// emblem -> logo -> no logo fallbacks all stay exercised.
        /// </summary>
        [Fact]
        public async Task GetOrgData_CoversOrgsWithoutEmblemOrLogo()
        {
            Dictionary<string, OrgData> orgData = await new AltinnCdnClientMock().GetOrgData();

            Assert.Contains(orgData.Values, o => !string.IsNullOrEmpty(o.Logo) && string.IsNullOrEmpty(o.Emblem));
            Assert.Contains(orgData.Values, o => string.IsNullOrEmpty(o.Logo) && string.IsNullOrEmpty(o.Emblem));
        }
    }
}
