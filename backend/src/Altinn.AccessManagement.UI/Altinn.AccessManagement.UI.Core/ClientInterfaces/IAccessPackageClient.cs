using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for client to integrate with access package metadata
    /// </summary>
    public interface IAccessPackageClient
    {
        /// <summary>
        /// Retrieve result of a search in all access packages. If no parameters are given, all access packages are returned
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned and searched in</param>
        /// <param name="searchString">the text to be searched for</param>
        /// <returns>List of access packages matching the search parameters</returns>
        Task<List<AccessPackage>> GetAccessPackageSearchMatches(string languageCode, string searchString);

        /// <summary>
        /// Retrieve all roles for a user
        /// </summary>
        /// <param name="languageCode">the language to use in texts returned and searched in</param>
        /// <param name="rightOwnerUuid">The right owner to retrieve roles for</param>
        /// <param name="rightHolderUuid">The right holder to retrieve roles for</param>
        Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid);

        /// <summary>
        /// Create a role delegation
        /// </summary>
        /// <param name="from">the user to delegate the role from</param>
        /// <param name="to">the user to delegate the role to</param>
        /// <param name="roleId">the role to delegate</param>
        /// <returns></returns>
        Task<HttpResponseMessage> CreateRoleDelegation(Guid from, Guid to, Guid roleId);
        
        /// <summary>
        /// Delete a role delegation
        /// </summary>
        /// <param name="assignmentId">the assignment id of the role delegation to delete</param>
        /// <returns></returns>
        Task<HttpResponseMessage> DeleteRoleDelegation(Guid assignmentId);
    }
}
