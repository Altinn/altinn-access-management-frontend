using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Dialogporten;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation;
using Altinn.AccessManagement.UI.Core.Models.InstanceDelegation.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Services
{
    /// <summary>
    /// Unit tests for <see cref="InstanceService"/>.
    /// </summary>
    public class InstanceServiceTest
    {
        private readonly Guid _party = Guid.NewGuid();
        private readonly Mock<IAuthenticationClient> _authenticationClient = new();
        private readonly Mock<IDialogportClient> _dialogportClient = new();
        private readonly Mock<IInstanceClient> _instanceClient = new();
        private readonly Mock<IResourceService> _resourceService = new();
        private readonly InstanceService _service;

        /// <summary>
        /// Initializes a new instance of the <see cref="InstanceServiceTest"/> class.
        /// </summary>
        public InstanceServiceTest()
        {
            _instanceClient
                .Setup(c => c.GetDelegatedInstances("nb", _party, _party, null, null, null))
                .ReturnsAsync(new List<InstancePermission> { InstancePermission("r1", "i1"), InstancePermission("r1", "i2") });
            _resourceService
                .Setup(r => r.GetResource("r1", "nb"))
                .ReturnsAsync(new ServiceResourceFE { Identifier = "r1", Title = "Ressurs 1" });

            _service = new InstanceService(
                _authenticationClient.Object,
                _dialogportClient.Object,
                _instanceClient.Object,
                new Mock<ILogger<InstanceService>>().Object,
                _resourceService.Object);
        }

        [Fact]
        public async Task GetDelegatedInstances_WithoutDialogLookup_SkipsTokenRefreshAndDialogporten()
        {
            List<InstanceDelegation> result = await _service.GetDelegatedInstances("nb", _party, _party, null, null, null, includeDialogLookup: false);

            Assert.Equal(2, result.Count);
            Assert.All(result, delegation => Assert.Null(delegation.DialogLookup));
            Assert.Equal("r1", result[0].Resource.Identifier);
            Assert.Equal("i1", result[0].Instance.RefId);
            _authenticationClient.Verify(a => a.GetPidEnrichedToken(), Times.Never);
            _dialogportClient.Verify(d => d.GetDialogLookupByInstanceRef(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task GetDelegatedInstances_DefaultOverload_StillEnrichesWithDialogporten()
        {
            _authenticationClient.Setup(a => a.GetPidEnrichedToken()).ReturnsAsync("enriched-token");
            _dialogportClient
                .Setup(d => d.GetDialogLookupByInstanceRef("enriched-token", "nb", It.IsAny<string>()))
                .ReturnsAsync((string token, string language, string instanceRef) => new DialogLookup { DialogId = Guid.NewGuid(), InstanceRef = instanceRef });

            List<InstanceDelegation> result = await _service.GetDelegatedInstances("nb", _party, _party, null, null, null);

            Assert.Equal(2, result.Count);
            Assert.All(result, delegation => Assert.NotNull(delegation.DialogLookup));
            Assert.Equal("i2", result[1].DialogLookup.InstanceRef);
            _authenticationClient.Verify(a => a.GetPidEnrichedToken(), Times.Once);
            _dialogportClient.Verify(d => d.GetDialogLookupByInstanceRef("enriched-token", "nb", It.IsAny<string>()), Times.Exactly(2));
        }

        private static InstancePermission InstancePermission(string resourceId, string instanceRef)
        {
            return new InstancePermission
            {
                Resource = new ResourceAM { RefId = resourceId },
                Instance = new DelegationInstance { RefId = instanceRef },
                Permissions = new List<Permission>(),
            };
        }
    }
}
