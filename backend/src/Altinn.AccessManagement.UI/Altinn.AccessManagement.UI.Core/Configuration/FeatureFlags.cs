namespace Altinn.AccessManagement.UI.Core.Configuration
{
    /// <summary>
    /// Feature flags configuration settings
    /// For use in turning off an on features in different envs
    /// </summary>
    public class FeatureFlags
    {
        /// <summary>
        /// Whether or not to only display popular SingleRights services
        /// </summary>
        public bool DisplayPopularSingleRightsServices { get; set; }

        /// <summary>
        /// Whether or not to display features related to the confetti package launch in the UI
        /// </summary>
        public bool DisplayConfettiPackage { get; set; }

        /// <summary>
        /// Whether or not to display features related to the limited preview launch in the UI
        /// </summary>
        public bool DisplayLimitedPreviewLaunch { get; set; }

        /// <summary>
        /// Whether to enable delegation request functionality in the UI
        /// </summary>
        public bool RequestDelegationEnabled { get; set; }

        /// <summary>
        /// Whether to enable role revocation functionality in the UI
        /// </summary>
        public bool RevokeRolesEnabled { get; set; }

        /// <summary>
        /// Whether or not to only display the service/resource delegation feature in the UI
        /// </summary>
        public bool DisplayResourceDelegation { get; set; }

        /// <summary>
        /// Whether or not to display the consent gui feature in the UI
        /// </summary>
        public bool DisplayConsentGui { get; set; }

        /// <summary>
        /// Whether to show the new AMUI to PRIV users
        /// </summary>
        public bool RestrictPrivUse { get; set; }

        /// <summary>
        /// Whether to enable cross platform links
        /// </summary>
        public bool CrossPlatformLinks { get; set; }

        /// <summary>
        /// Whether to display the settings page in the sidebar
        /// </summary>
        public bool DisplaySettingsPage { get; set; }

        /// <summary>
        /// Whether to display the POA overview page in the sidebar
        /// </summary>
        public bool DisplayPoaOverviewPage { get; set; }

        /// <summary>
        /// Whether to use the new actors list populated by the connections API
        /// </summary>
        public bool UseNewActorsList { get; set; }

        /// <summary>
        /// Whether to use the new logout URL structure
        /// </summary>
        public bool UseNewLogoutUrl { get; set; }
    }
}
