using Altinn.AccessManagement.UI.Core.Models.Role;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
        /// <summary>
        /// Service for access package logic
        /// </summary>
        public interface IRoleService
        {
                /// <summary>
                ///     Gets the roles for a user
                /// </summary>
                /// <param name="languageCode">languageCode.</param>
                /// <param name="rightOwnerUuid">the right owner to retrieve roles for</param>
                /// <param name="rightHolderUuid">the right holder to retrieve roles for</param>
                /// <returns></returns>
                Task<List<RoleAssignment>> GetRolesForUser(string languageCode, Guid rightOwnerUuid, Guid rightHolderUuid);

                /// <summary>
                /// Creates a role delegation
                /// </summary>
                /// <param name="from">the user to delegate the role from</param>
                /// <param name="to">the user to delegate the role to</param>
                /// <param name="roleId">the role to delegate</param>
                /// <returns></returns>
                Task<HttpResponseMessage> CreateRoleDelegation(Guid from, Guid to, Guid roleId);

                /// <summary>
                /// Deletes a role delegation
                /// </summary>
                /// <param name="assignmentId">the assignment id of the role delegation to delete</param>
                /// <returns></returns>
                Task<HttpResponseMessage> DeleteRoleDelegation(Guid assignmentId);
    }
}
