using System.Diagnostics.CodeAnalysis;
using Altinn.AccessManagement.Configuration;
using Azure.Identity;
using Microsoft.Extensions.Configuration.AzureAppConfiguration;

namespace Altinn.AccessManagement.UI.Extensions
{
    /// <summary>
    /// Configuration of Azure App Configuration as a configuration source, providing feature flags
    /// and key-values labeled for this application. Mirrors AddAltinnAppConfiguration in
    /// Altinn.Authorization.ServiceDefaults (same configuration keys), so this setup can be
    /// replaced by that package once the repos are merged.
    /// </summary>
    [ExcludeFromCodeCoverage] // Configuration wiring only - connecting requires a live App Configuration endpoint
    public static class AppConfigurationExtensions
    {
        /// <summary>
        /// Adds Azure App Configuration as a configuration source when Altinn:AppConfiguration:Endpoint
        /// and Altinn:AppConfiguration:Label are set. When they are not (e.g. locally), the app runs on
        /// appsettings values alone.
        /// </summary>
        /// <param name="config">the configuration manager to add the configuration source to</param>
        /// <param name="logger">setup logger</param>
        /// <returns>true if Azure App Configuration was added as a configuration source, false when skipped or unreachable</returns>
        public static bool AddAltinnAppConfiguration(this ConfigurationManager config, ILogger logger)
        {
            string appConfigurationEndpoint = config["Altinn:AppConfiguration:Endpoint"];
            string appConfigurationLabel = config["Altinn:AppConfiguration:Label"];

            if (string.IsNullOrEmpty(appConfigurationEndpoint) || string.IsNullOrEmpty(appConfigurationLabel))
            {
                logger.LogInformation("Program // Altinn:AppConfiguration:Endpoint or Label not set - skipping Azure App Configuration");
                return false;
            }

            ChainedTokenCredential credential = new ChainedTokenCredential(new ManagedIdentityCredential(ManagedIdentityId.SystemAssigned), new AzureCliCredential());

            try
            {
                config.AddAzureAppConfiguration(options =>
                {
                    options.Connect(new Uri(appConfigurationEndpoint), credential);
                    options.Select(KeyFilter.Any, appConfigurationLabel);
                    options.ConfigureRefresh(refresh =>
                    {
                        refresh.RegisterAll();
                        refresh.SetRefreshInterval(RefreshAppConfigurationHostedService.RefreshInterval);
                    });

                    if (config.GetValue("Altinn:AppConfiguration:FeatureFlags:Enable", false))
                    {
                        options.UseFeatureFlags(featureFlagOptions =>
                        {
                            featureFlagOptions.Select(KeyFilter.Any, appConfigurationLabel);
                            featureFlagOptions.SetRefreshInterval(RefreshAppConfigurationHostedService.RefreshInterval);
                        });
                    }
                });
            }
            catch (Exception appConfigurationException)
            {
                logger.LogError(appConfigurationException, "Program // Unable to connect to Azure App Configuration - falling back to appsettings values");
                return false;
            }

            return true;
        }
    }
}
