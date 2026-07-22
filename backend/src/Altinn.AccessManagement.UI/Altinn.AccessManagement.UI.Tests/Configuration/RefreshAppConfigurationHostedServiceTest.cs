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
        private readonly TimerTrackingFakeTimeProvider _timeProvider = new TimerTrackingFakeTimeProvider();
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

            // StartAsync queues ExecuteAsync without running it (as of .NET 10), so wait for the
            // service to arm its timer; from then on each advance fires exactly one tick.
            await _timeProvider.TimerCreated.WaitAsync(TimeSpan.FromSeconds(5));

            await AdvanceOneIntervalAsync();

            _refresher1.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Once);
            _refresher2.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Once);

            await AdvanceOneIntervalAsync();

            _refresher1.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
            _refresher2.Verify(r => r.TryRefreshAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));

            await _service.StopAsync(CancellationToken.None);
        }

        private static Mock<IConfigurationRefresher> NewRefresher()
        {
            Mock<IConfigurationRefresher> refresher = new Mock<IConfigurationRefresher>();
            refresher.Setup(r => r.TryRefreshAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
            return refresher;
        }

        /// <summary>
        /// Advances fake time by one refresh interval and waits until both refreshers have processed
        /// the resulting tick, which happens asynchronously as the service's timer loop continuations
        /// run. Time is only ever advanced here, one interval at a time with the timer already armed,
        /// so exactly one tick fires per call and the exact-count verifications are race free.
        /// </summary>
        private async Task AdvanceOneIntervalAsync()
        {
            int expected1 = _refresher1.Invocations.Count + 1;
            int expected2 = _refresher2.Invocations.Count + 1;
            _timeProvider.Advance(RefreshAppConfigurationHostedService.RefreshInterval);

            DateTime deadline = DateTime.UtcNow.AddSeconds(5);
            while ((_refresher1.Invocations.Count < expected1 || _refresher2.Invocations.Count < expected2) && DateTime.UtcNow < deadline)
            {
                await Task.Delay(10);
            }
        }

        /// <summary>
        /// Fake time provider that additionally exposes when the service under test has created
        /// (armed) its refresh timer, so tests know when advancing time will produce ticks.
        /// </summary>
        private sealed class TimerTrackingFakeTimeProvider : FakeTimeProvider
        {
            private readonly TaskCompletionSource _timerCreated = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

            public Task TimerCreated => _timerCreated.Task;

            public override ITimer CreateTimer(TimerCallback callback, object state, TimeSpan dueTime, TimeSpan period)
            {
                ITimer timer = base.CreateTimer(callback, state, dueTime, period);
                _timerCreated.TrySetResult();
                return timer;
            }
        }
    }
}
