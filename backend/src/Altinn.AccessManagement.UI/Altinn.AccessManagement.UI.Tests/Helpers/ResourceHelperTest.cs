using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Helpers;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Helpers
{
    public class ResourceHelperTest
    {
        private static readonly Dictionary<string, OrgData> Orgs = new()
        {
            ["skd"] = new OrgData { Emblem = "https://altinncdn.no/orgs/skd/skd.svg", Logo = "https://altinncdn.no/orgs/skd/skd.png" },
        };

        // Strict: any call to the resource service (i.e. a resource registry lookup) fails the test.
        private readonly Mock<IResourceService> _resourceService = new(MockBehavior.Strict);
        private readonly Mock<IAltinnCdnService> _altinnCdnService = new();
        private readonly ResourceHelper _helper;

        public ResourceHelperTest()
        {
            _altinnCdnService.Setup(s => s.GetOrgData()).ReturnsAsync(Orgs);
            _helper = new ResourceHelper(_resourceService.Object, Mock.Of<IAccessPackageClient>(), _altinnCdnService.Object);
        }

        [Fact]
        public async Task MapToAccessPackagesFE_MapsResourcesFromAccessManagementWithoutRegistryLookup()
        {
            // Arrange: a package large enough that per-resource registry lookups would be a bottleneck
            List<ResourceAM> resources = Enumerable.Range(0, 250)
                .Select(i => new ResourceAM
                {
                    RefId = $"resource-{i}",
                    Name = $"Resource {i}",
                    Provider = new Provider { Code = "skd", Name = "Skatteetaten", LogoUrl = "https://example.com/untrusted.png" },
                })
                .ToList();
            AccessPackage accessPackage = new() { Id = Guid.NewGuid(), Name = "Package", Resources = resources };

            // Act
            List<AccessPackageFE> actual = await _helper.MapToAccessPackagesFE([accessPackage]);

            // Assert
            ServiceResourceFE first = Assert.Single(actual).Resources.First();
            Assert.Equal(250, actual[0].Resources.Count);
            Assert.Equal("resource-0", first.Identifier);
            Assert.Equal("Resource 0", first.Title);
            Assert.Equal("Skatteetaten", first.ResourceOwnerName);
            Assert.Equal("https://altinncdn.no/orgs/skd/skd.svg", first.ResourceOwnerLogoUrl);
            _resourceService.VerifyNoOtherCalls();
            _altinnCdnService.Verify(s => s.GetOrgData(), Times.Once);
        }

        [Fact]
        public async Task MapToServiceResourcesFE_MapsRoleResourcesWithoutRegistryLookup()
        {
            // Act
            List<ServiceResourceFE> actual = await _helper.MapToServiceResourcesFE(
                [new ResourceAM { RefId = "role-resource", Name = "Role resource", Provider = new Provider { Code = "SKD" } }]);

            // Assert
            ServiceResourceFE resource = Assert.Single(actual);
            Assert.Equal("role-resource", resource.Identifier);
            Assert.Equal("https://altinncdn.no/orgs/skd/skd.svg", resource.ResourceOwnerLogoUrl);
            _resourceService.VerifyNoOtherCalls();
        }
    }
}
