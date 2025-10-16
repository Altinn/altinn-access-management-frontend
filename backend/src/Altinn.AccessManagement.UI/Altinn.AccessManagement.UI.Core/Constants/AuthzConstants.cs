namespace Altinn.AccessManagement.Core.Constants
{
    /// <summary>
    /// Constants related to authorization.
    /// </summary>
    public static class AuthzConstants
    {
        /// <summary>
        /// Policy tag for authorizing designer access
        /// </summary>
        public const string POLICY_STUDIO_DESIGNER = "StudioDesignerAccess";

        /// <summary>
        /// Policy tag for authorizing Altinn.Platform.Authorization API access from AltinnII Authorization
        /// </summary>
        public const string ALTINNII_AUTHORIZATION = "AltinnIIAuthorizationAccess";

        /// <summary>
        /// Policy tag for authorizing Altinn.Platform.Authorization API access from Altinn Authorization
        /// </summary>
        public const string POLICY_ACCESS_MANAGEMENT_ENDUSER_READ_WITH_PASS_THROUGH = "AccessManagementEndUserReadOrAuthorizedParty";
        
        /// <summary>
        /// Policy tag for authorizing if user has read access to the client administration API
        /// </summary>
        public const string POLICY_ACCESS_MANAGEMENT_CLIENT_ADMINISTRATION_READ_WITH_PASS_THROUGH = "AccessManagementClientAdministrationReadOrAuthorizedParty";

        /// <summary>
        /// Policy tag for authorizing if user has read access to the Altinn profil API varslingsdaresser for virksomheter resource.
        /// </summary>
        public const string POLICY_ACCESS_MANAGEMENT_PROFIL_API_VARSLINGSDARESSER_FOR_VIRKSOMHETER_READ_WITH_PASS_THROUGH = "AccessManagementProfilApiVarslingsdaresserForVirksomheterReadOrAuthorizedParty";

        /// <summary>
        /// Policy tag for authorizing if user has read access to the altinn_access_management_hovedadmin resource.
        /// </summary>
        public const string POLICY_ACCESS_MANAGEMENT_HOVEDADMIN_READ_WITH_PASS_THROUGH = "AccessManagementHovedadminReadOrAuthorizedParty";
    }
}
