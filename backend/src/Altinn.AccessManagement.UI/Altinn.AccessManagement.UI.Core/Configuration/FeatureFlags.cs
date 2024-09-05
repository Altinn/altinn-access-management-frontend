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
    }
}
