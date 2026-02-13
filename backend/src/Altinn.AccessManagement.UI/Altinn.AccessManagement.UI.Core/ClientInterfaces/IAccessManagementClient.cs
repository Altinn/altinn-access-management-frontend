using Altinn.AccessManagement.UI.Core.Models;
using Altinn.AccessManagement.UI.Core.Models.AccessManagement;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Models.SingleRight;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
        /// <summary>
        ///     Interface for client to integrate with access management
        /// </summary>
        public interface IAccessManagementClient
        {
                /// <summary>
                /// Retrieve party if party exists in the authenticated users reporteelist
                /// </summary>
                /// <param name="partyId">party id</param>
                /// <returns></returns>
                Task<AuthorizedParty> GetPartyFromReporteeListIfExists(int partyId);

                /// <summary>
                /// Gets the right holders of a given reportee
                /// </summary>
                /// <param name="partyId">The party Id of the reportee</param>
                /// <returns>List of parties holding rights for the partyId</returns>
                Task<List<AuthorizedParty>> GetReporteeRightHolders(int partyId);

                /// <summary>
                /// Gets a list of all reportees for a given party
                /// </summary>
                /// <param name="partyId">The id of the party</param>
                Task<List<AuthorizedParty>> GetReporteeList(Guid partyId);

                /// <summary>
                /// Gets all accesses of a given right holder for a reportee
                /// </summary>
                /// <param name = "from" > The uuid for the reportee which the right holder has access to</param>
                /// <param name="to">The uuid for the right holder whose accesses are to be returned</param>
                /// <returns>All right holder's accesses</returns>
                Task<UserAccesses> GetUserAccesses(Guid from, Guid to);

                //// Single Rights

                /// <summary>
                ///     Retrieves the single rights for a specific right holder.
                /// </summary>
                /// <param name="party">The party identifier.</param>
                /// <param name="userId">The user identifier.</param>
                /// <returns></returns>
                Task<HttpResponseMessage> GetSingleRightsForRightholder(string party, string userId);

                /// <summary>
                /// Revokes a single right on a resource that has been granted from one party to another.
                /// </summary>
                /// <param name="from">The right owner on which behalf access to the resource has been granted.</param>
                /// <param name="to">The right holder that has been granted access to the resource.</param>
                /// <param name="resourceId">The identifier of the resource that has been granted access to</param>
                /// <param name="rightKey">The identifier of the right that is to be revoked</param>
                /// <returns></returns>
                Task<HttpResponseMessage> RevokeRightDelegation(Guid from, Guid to, string resourceId, string rightKey);

                //// Access packages (handled by IAccessPackageClient)

                //// Roles 

                /// <summary>
                /// Retrieve result of a search in all roles. If no parameters are given, all roles are returned
                /// </summary>
                /// <param name="languageCode">the language to use in texts returned and searched in</param>
                /// <param name="searchString">the text to be searched for</param>
                /// <returns>List of access packages matching the search parameters</returns>
                Task<List<Role>> GetRoleSearchMatches(string languageCode, string searchString);

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
