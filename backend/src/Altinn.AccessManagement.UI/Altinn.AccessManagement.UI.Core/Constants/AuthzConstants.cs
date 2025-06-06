﻿namespace Altinn.AccessManagement.Core.Constants
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
    }
}
