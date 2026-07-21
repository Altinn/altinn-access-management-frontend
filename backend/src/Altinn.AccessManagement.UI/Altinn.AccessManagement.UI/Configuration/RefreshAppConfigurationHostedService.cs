using Microsoft.Extensions.Configuration.AzureAppConfiguration;

namespace Altinn.AccessManagement.Configuration
{
    /// <summary>
    /// Periodically refreshes configuration and feature flags from Azure App Configuration,
    /// so that changes made in Azure take effect without a redeploy.
    /// </summary>
    public sealed class RefreshAppConfigurationHostedService : BackgroundService
    {
        /// <summary>
        /// How often configuration is refreshed from Azure App Configuration.
        /// </summary>
        public static readonly TimeSpan RefreshInterval = TimeSpan.FromMinutes(1);

        private readonly IConfigurationRefresherProvider _refresherProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="RefreshAppConfigurationHostedService" /> class.
        /// </summary>
        /// <param name="refresherProvider">provider of the configuration refreshers to trigger</param>
        public RefreshAppConfigurationHostedService(IConfigurationRefresherProvider refresherProvider)
        {
            _refresherProvider = refresherProvider;
        }

        /// <inheritdoc />
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using PeriodicTimer timer = new PeriodicTimer(RefreshInterval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                foreach (IConfigurationRefresher refresher in _refresherProvider.Refreshers)
                {
                    await refresher.TryRefreshAsync(stoppingToken);
                }
            }
        }
    }
}
