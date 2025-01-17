using Altinn.AccessManagement.UI.Core.Models.Role;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
        /// <summary>
        /// Service for access package logic
        /// </summary>
        public interface IRoleService
        {
                /// <summary>
                ///     Performs a search for access packages based on the provided parameters and sorts them into a list of areas for frontend to display
                /// </summary>
                /// <param name="languageCode">languageCode.</param>
                /// <returns>the resources that match the filters and search string corresponding to the provided page.</returns>
                Task<List<Role>> GetAllRoles(string languageCode);

                /// <summary>
                ///     Gets the roles for a user
                /// </summary>
                /// <param name="languageCode">languageCode.</param>
                /// <param name="userId">user id.</param>
                /// <returns></returns>
                Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid);
    }
}
