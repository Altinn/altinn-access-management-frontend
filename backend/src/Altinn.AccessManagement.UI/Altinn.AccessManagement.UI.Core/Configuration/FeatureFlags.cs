namespace Altinn.AccessManagement.UI.Core.Configuration
{
    /// <summary>
    /// Feature flag names for use in turning features off and on in different envs.
    /// Flag values are read through <see cref="Microsoft.FeatureManagement.IFeatureManager" />, sourced from
    /// Azure App Configuration in deployed environments and from the FeatureManagement
    /// section in appsettings when running locally.
    /// </summary>
    public static class FeatureFlags
    {
        /// <summary>
        /// Whether or not to only display popular SingleRights services
        /// </summary>
        public const string DisplayPopularSingleRightsServices = "AccessManagementUI.DisplayPopularSingleRightsServices";

        /// <summary>
        /// Whether or not to use the new version of client delegation for single rights services
        /// </summary>
        public const string UseNewSingleRightsClientDelegation = "AccessManagementUI.UseNewSingleRightsClientDelegation";

        /// <summary>
        /// Whether or not to show handled sent and received access package and resource requests
        /// </summary>
        public const string ShowHandledRequests = "AccessManagementUI.ShowHandledRequests";
    }
}
