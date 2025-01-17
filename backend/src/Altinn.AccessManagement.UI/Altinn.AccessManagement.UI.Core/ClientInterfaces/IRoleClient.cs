using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;


namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IRoleClient
    {
        /// <summary>
        /// Retrieve all roles. If no parameters are given, all access packages are returned
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned and searched in</param>
        /// <returns>List of access packages matching the search parameters</returns>
        public Task<List<Role>> GetRoles(string languageCode);

        /// <summary>
        /// Retrieve all roles for a user
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned and searched in</param>
        /// <param name="rightOwnerUuid">the user to retrieve roles for</param>
        /// <param name="rightHolderUuid">the user to retrieve roles for</param>
        /// <returns>List of access packages matching the search parameters</returns>
        public Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid);
    }
}
