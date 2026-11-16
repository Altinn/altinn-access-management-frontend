using Altinn.AccessManagement.UI.Core.Enums;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    public class ResourceUtilsTest
    {
        private static readonly Dictionary<string, OrgData> Orgs = new()
        {
            ["skd"] = new OrgData { Emblem = "https://cdn/skd.svg", Logo = "https://cdn/skd.png" },
            ["nrna"] = new OrgData { Emblem = string.Empty, Logo = "https://cdn/nrna.png" },
            ["blank"] = new OrgData { Emblem = "  ", Logo = " " },
        };

        [Theory]
        [InlineData("skd", "https://cdn/skd.svg")]
        [InlineData("SKD", "https://cdn/skd.svg")]
        [InlineData("nrna", "https://cdn/nrna.png")]
        [InlineData("blank", null)]
        [InlineData("unknown", null)]
        [InlineData("", null)]
        [InlineData(null, null)]
        public void ResolveOwnerLogoUrl_PrefersEmblemThenLogo(string orgCode, string expected)
        {
            Assert.Equal(expected, ResourceUtils.ResolveOwnerLogoUrl(Orgs, orgCode));
        }

        [Fact]
        public void ResolveOwnerLogoUrl_WithoutOrgData_ReturnsNull()
        {
            Assert.Null(ResourceUtils.ResolveOwnerLogoUrl(null, "skd"));
        }

        [Fact]
        public void MapToServiceResourceFE_FromRegistry_ResolvesLogoFromOwnerOrgcode()
        {
            ServiceResource resource = new()
            {
                Identifier = "res",
                Title = new Dictionary<string, string> { ["nb"] = "Tittel", ["en"] = "Title" },
                HasCompetentAuthority = new CompetentAuthority { Orgcode = "SKD", Organization = "974761076" },
            };

            ServiceResourceFE actual = ResourceUtils.MapToServiceResourceFE(resource, "en", Orgs);

            Assert.Equal("Title", actual.Title);
            Assert.Equal("SKD", actual.ResourceOwnerOrgcode);
            Assert.Equal("https://cdn/skd.svg", actual.ResourceOwnerLogoUrl);
        }

        [Fact]
        public void MapToServiceResourceFE_FromRegistry_WithoutCompetentAuthority_DoesNotThrow()
        {
            ServiceResourceFE actual = ResourceUtils.MapToServiceResourceFE(new ServiceResource { Identifier = "res" }, "nb", Orgs);

            Assert.Equal("res", actual.Identifier);
            Assert.Null(actual.ResourceOwnerLogoUrl);
        }

        [Fact]
        public void MapToServiceResourceFE_FromAccessManagement_IgnoresProviderLogoUrl()
        {
            ResourceAM resource = new()
            {
                RefId = "am-res",
                Name = "AM resource",
                Provider = new Provider { Code = "skd", Name = "Skatteetaten", RefId = "974761076", LogoUrl = "https://example.com/untrusted.png" },
                Type = new AccessPackageResourceType { Name = "MaskinportenSchema" },
            };

            ServiceResourceFE actual = ResourceUtils.MapToServiceResourceFE(resource, Orgs);

            Assert.Equal("am-res", actual.Identifier);
            Assert.Equal("AM resource", actual.Title);
            Assert.Equal("Skatteetaten", actual.ResourceOwnerName);
            Assert.Equal("974761076", actual.ResourceOwnerOrgNumber);
            Assert.Equal("https://cdn/skd.svg", actual.ResourceOwnerLogoUrl);
            Assert.Equal(ResourceType.MaskinportenSchema, actual.ResourceType);
        }

        [Fact]
        public void MapToServiceResourceFE_FromAccessManagement_WithoutProvider_DoesNotThrow()
        {
            ServiceResourceFE actual = ResourceUtils.MapToServiceResourceFE(new ResourceAM { RefId = "am-res" }, Orgs);

            Assert.Equal("am-res", actual.Identifier);
            Assert.Null(actual.ResourceOwnerName);
            Assert.Null(actual.ResourceOwnerLogoUrl);
            Assert.Equal(ResourceType.Default, actual.ResourceType);
        }
    }
}
