using Altinn.AccessManagement.UI.Controllers;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using Altinn.AccessManagement.UI.Integration.Clients;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace Altinn.AccessManagement.UI.Tests.Configuration
{
    /// <summary>
    /// Tests that the real (non-mock) platform clients can actually be constructed by the DI
    /// container. The test suite runs with every client mocked, so a broken registration for a real
    /// client would otherwise only show up at runtime in a deployed environment.
    /// </summary>
    public class ClientRegistrationTest : IClassFixture<CustomWebApplicationFactory<AltinnCdnController>>
    {
        private readonly CustomWebApplicationFactory<AltinnCdnController> _factory;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClientRegistrationTest"/> class.
        /// </summary>
        /// <param name="factory">CustomWebApplicationFactory</param>
        public ClientRegistrationTest(CustomWebApplicationFactory<AltinnCdnController> factory)
        {
            _factory = factory;
        }

        /// <summary>
        /// Test case: The Altinn CDN client is configured to use the real implementation.
        /// Expected: It resolves, including the HttpClient it depends on.
        /// </summary>
        [Fact]
        public void AltinnCdnClient_ResolvesWhenNotMocked()
        {
            using IServiceScope scope = CreateScopeWithRealClients();

            IAltinnCdnClient client = scope.ServiceProvider.GetRequiredService<IAltinnCdnClient>();

            Assert.IsType<AltinnCdnClient>(client);
        }

        /// <summary>
        /// Test case: The service that depends on the real Altinn CDN client is resolved.
        /// Expected: The whole chain resolves, so a CDN outage is the only way to lose org data.
        /// </summary>
        [Fact]
        public async Task AltinnCdnService_ResolvesWithRealClient()
        {
            using IServiceScope scope = CreateScopeWithRealClients();

            IAltinnCdnService service = scope.ServiceProvider.GetRequiredService<IAltinnCdnService>();

            // The CDN is not reachable from the test run; the service must degrade, not throw.
            Dictionary<string, OrgData> orgData = await service.GetOrgData();
            Assert.NotNull(orgData);
        }

        private IServiceScope CreateScopeWithRealClients()
        {
            IWebHostBuilder Configure(IWebHostBuilder builder) =>
                builder.UseSetting("MockSettings:AltinnCdn", "false");

            return _factory.WithWebHostBuilder(builder => Configure(builder))
                .Services.CreateScope();
        }
    }
}
