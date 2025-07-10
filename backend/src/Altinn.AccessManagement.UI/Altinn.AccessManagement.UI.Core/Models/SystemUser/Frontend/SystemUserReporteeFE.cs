using Altinn.AccessManagement.UI.Core.Models.AccessManagement;

namespace Altinn.AccessManagement.UI.Core.Models.SystemUser.Frontend
{
    /// <summary>
    /// DTO with permisisons a user has in system user UI
    /// </summary>
    public class SystemUserReporteeFE
    {
        /// <summary>
        /// Logged in party
        /// </summary>
        public AuthorizedParty Party { get; set; }

        /// <summary>
        /// Has create system user permission
        /// </summary>
        public bool HasCreateSystemuserPermission { get; set; }

        /// <summary>
        /// Has client administration permission
        /// </summary>
        public bool HasClientAdministrationPermission { get; set; }
    }
}