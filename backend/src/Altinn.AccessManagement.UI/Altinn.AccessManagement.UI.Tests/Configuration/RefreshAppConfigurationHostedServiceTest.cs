using Altinn.AccessManagement.Configuration;
using Microsoft.Extensions.Configuration.AzureAppConfiguration;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace Altinn.AccessManagement.UI.Tests.Configuration
{
    /// <summary>
    /// Test class for <see cref="RefreshAppConfigurationHostedService"/>
    /// </summary>
    public class RefreshAppConfigurationHostedServiceTest
    {
        private readonly Mock<IConfigurationRefresher> _refresher1 = NewRefresher();
        private readonly Mock<IConfigurationRefresher> _refresher2 = NewRefresher();
        private readonly FakeTimeProvider _timeProvider = new FakeTimeProvider();
        private readonly RefreshAppConfigurationHostedService _service;

        public RefreshAppConfigurationHostedServiceTest()
        {
            Mock<IConfigurationRefresherProvider> refresherProvider = new Mock<IConfigurationRefresherProvider>();
            refresherProvider.Setup(p => p.Refreshers).Returns(new[] { _refresher1.Object, _refresher2.Object });
            _service = new RefreshAppConfigurationHostedService(refresherProvider.Object, _timeProvider);
        }

        /// <summary>
        /// Test case: The service runs while time passes
        /// Expected: All refreshers are refreshed once per interval
        /// </summary>
        [Fact]
        public async Task ExecuteAsync_RefreshesAllRefreshersOnEachTick()
        {
            await _service.StartAsync(CancellationToken.None);

            await AdvanceTimeUntilInvocationsAsync(_refresher1, 1);

            _refresher1.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Once);
            _refresher2.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Once);

            await AdvanceTimeUntilInvocationsAsync(_refresher1, 2);

            _refresher1.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
            _refresher2.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));

            await _service.StopAsync(CancellationToken.None);
        }

        /// <summary>
        /// Test case: The service is stopped before the first interval has passed
        /// Expected: No refreshes are triggered when time passes after the stop
        /// </summary>
        [Fact]
        public async Task ExecuteAsync_DoesNotRefreshAfterStop()
        {
            await _service.StartAsync(CancellationToken.None);
            await _service.StopAsync(CancellationToken.None);

            _timeProvider.Advance(RefreshAppConfigurationHostedService.RefreshInterval);

            _refresher1.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Never);
            _refresher2.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Never);
        }

        private static Mock<IConfigurationRefresher> NewRefresher()
        {
            Mock<IConfigurationRefresher> refresher = new Mock<IConfigurationRefresher>();
            refresher.Setup(r => r.TryRefreshAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
            return refresher;
        }

        /// <summary>
        /// Advances fake time one refresh interval at a time until the refresher has been invoked
        /// the expected number of times, yielding between advances so the service's timer loop
        /// (which runs as background continuations) gets to both arm the timer and process ticks.
        /// </summary>
        private async Task AdvanceTimeUntilInvocationsAsync(Mock<IConfigurationRefresher> refresher, int expectedCount)
        {
            DateTime deadline = DateTime.UtcNow.AddSeconds(5);
            while (refresher.Invocations.Count < expectedCount && DateTime.UtcNow < deadline)
            {
                _timeProvider.Advance(RefreshAppConfigurationHostedService.RefreshInterval);
                await Task.Delay(10);
            }
        }
    }
}
