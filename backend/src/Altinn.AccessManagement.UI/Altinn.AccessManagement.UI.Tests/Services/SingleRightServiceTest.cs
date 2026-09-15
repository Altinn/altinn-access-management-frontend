using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.ResourceOwner;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;
using Altinn.AccessManagement.UI.Core.Services;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Services
{
    /// <summary>
    /// Unit tests for <see cref="SingleRightService"/>.
    /// </summary>
    public class SingleRightServiceTest
    {
        private static readonly TimeSpan WaitTimeout = TimeSpan.FromSeconds(10);

        [Fact]
        public async Task GetDelegatedResources_ResolvesResourcesConcurrently_AndKeepsOrder()
        {
            Guid party = Guid.NewGuid();
            var singleRightClient = new Mock<ISingleRightClient>();
            var resourceRegistryClient = new Mock<IResourceRegistryClient>();
            var resourceService = new Mock<IResourceService>();
            var pending = new ConcurrentDictionary<string, TaskCompletionSource<ServiceResource>>();

            singleRightClient
                .Setup(c => c.GetDelegatedResources("nb", party, party, null))
                .ReturnsAsync(new List<ResourcePermission> { ResourcePermission("a"), ResourcePermission("b"), ResourcePermission("c") });
            resourceRegistryClient
                .Setup(c => c.GetAllResourceOwners())
                .ReturnsAsync(new OrgList { Orgs = new Dictionary<string, Org>() });
            resourceService
                .Setup(r => r.GetResource(It.IsAny<string>()))
                .Returns((string id) => pending.GetOrAdd(id, _ => new TaskCompletionSource<ServiceResource>(TaskCreationOptions.RunContinuationsAsynchronously)).Task);

            var service = new SingleRightService(resourceService.Object, resourceRegistryClient.Object, singleRightClient.Object);

            Task<List<ResourceDelegation>> call = service.GetDelegatedResources("nb", party, party, null);

            // All three resource lookups are issued before any of them has completed.
            await WaitUntilAsync(() => pending.Count == 3, "all resource lookups started");
            Assert.False(call.IsCompleted);

            // Complete out of order; "b" resolves to nothing and must be dropped.
            pending["c"].SetResult(ServiceResource("c"));
            pending["a"].SetResult(ServiceResource("a"));
            pending["b"].SetResult(null);

            List<ResourceDelegation> result = await call;

            Assert.Equal(new[] { "a", "c" }, result.Select(delegation => delegation.Resource.Identifier));
            Assert.Equal("Ressurs A", result[0].Resource.Title);
        }

        private static ResourcePermission ResourcePermission(string resourceId)
        {
            return new ResourcePermission
            {
                Resource = new ResourceAM { RefId = resourceId },
                Permissions = new List<Permission>(),
            };
        }

        private static ServiceResource ServiceResource(string resourceId)
        {
            return new ServiceResource
            {
                Identifier = resourceId,
                Title = new Dictionary<string, string> { ["nb"] = $"Ressurs {resourceId.ToUpperInvariant()}" },
            };
        }

        private static async Task WaitUntilAsync(Func<bool> condition, string description)
        {
            DateTime deadline = DateTime.UtcNow + WaitTimeout;
            while (!condition())
            {
                if (DateTime.UtcNow > deadline)
                {
                    throw new TimeoutException($"Timed out waiting for: {description}");
                }

                await Task.Delay(10);
            }
        }
    }
}
