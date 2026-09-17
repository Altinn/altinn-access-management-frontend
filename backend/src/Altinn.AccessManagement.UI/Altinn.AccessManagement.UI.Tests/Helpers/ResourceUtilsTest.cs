using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.Common;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    /// <summary>
    /// Tests the single place service owner logos are resolved. The rule is emblem, then logo, then
    /// nothing — anything the org data cannot answer must come back as null so the frontend renders
    /// an avatar rather than a broken image.
    /// </summary>
    public class ResourceUtilsTest
    {
        private static Dictionary<string, OrgData> Orgs(params (string Code, string Logo, string Emblem)[] orgs)
        {
            var map = new Dictionary<string, OrgData>(StringComparer.OrdinalIgnoreCase);
            foreach ((string code, string logo, string emblem) in orgs)
            {
                map[code] = new OrgData { Logo = logo, Emblem = emblem };
            }

            return map;
        }

        /// <summary>
        /// Test case: The org has both an emblem and a logo.
        /// Expected: The emblem wins — the UI renders the mark into square slots.
        /// </summary>
        [Fact]
        public void ResolveOwnerLogoUrl_PrefersEmblemOverLogo()
        {
            var orgs = Orgs(("skd", "logo.png", "emblem.svg"));

            Assert.Equal("emblem.svg", ResourceUtils.ResolveOwnerLogoUrl(orgs, "skd"));
        }

        /// <summary>
        /// Test case: The org has a logo but no usable emblem.
        /// Expected: The logo is used.
        /// </summary>
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void ResolveOwnerLogoUrl_FallsBackToLogoWhenEmblemIsMissing(string emblem)
        {
            var orgs = Orgs(("skd", "logo.png", emblem));

            Assert.Equal("logo.png", ResourceUtils.ResolveOwnerLogoUrl(orgs, "skd"));
        }

        /// <summary>
        /// Test case: The org has neither a usable emblem nor a usable logo.
        /// Expected: Null, so the caller falls back to an avatar.
        /// </summary>
        [Fact]
        public void ResolveOwnerLogoUrl_ReturnsNullWhenOrgHasNoImages()
        {
            var orgs = Orgs(("dihe", string.Empty, null));

            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(orgs, "dihe"));
        }

        /// <summary>
        /// Test case: Resource metadata spells the org code in a different casing than the CDN does,
        /// which it routinely does ("TTD" vs "ttd").
        /// Expected: The org is still found.
        /// </summary>
        [Fact]
        public void ResolveOwnerLogoUrl_MatchesOrgCodeRegardlessOfCasingAndPadding()
        {
            var orgs = Orgs(("ttd", "logo.png", "emblem.svg"));

            Assert.Equal("emblem.svg", ResourceUtils.ResolveOwnerLogoUrl(orgs, "TTD"));
            Assert.Equal("emblem.svg", ResourceUtils.ResolveOwnerLogoUrl(orgs, " ttd "));
        }

        /// <summary>
        /// Test case: The resource has no org code, or an org the CDN does not know, or the org data
        /// could not be fetched at all.
        /// Expected: Null every time, and never an exception — a missing logo must not break a page.
        /// </summary>
        [Fact]
        public void ResolveOwnerLogoUrl_ReturnsNullForUnresolvableInput()
        {
            var orgs = Orgs(("skd", "logo.png", "emblem.svg"));

            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(orgs, null));
            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(orgs, string.Empty));
            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(orgs, "   "));
            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(orgs, "unknown-org"));
            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(null, "skd"));
            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(new Dictionary<string, OrgData> { { "skd", null } }, "skd"));
        }
    }
}
