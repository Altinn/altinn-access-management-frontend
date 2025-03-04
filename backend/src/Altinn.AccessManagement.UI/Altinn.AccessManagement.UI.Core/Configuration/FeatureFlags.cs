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
        public bool ConfettiPackage { get; set; }
    }
}
