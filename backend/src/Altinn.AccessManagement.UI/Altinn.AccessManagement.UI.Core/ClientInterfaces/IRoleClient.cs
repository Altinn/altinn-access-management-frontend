using Altinn.AccessManagement.UI.Core.Models.Common;
using Altinn.AccessManagement.UI.Core.Models.Role;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Core.ClientInterfaces
{
    /// <summary>
    /// Interface for role client
    /// </summary>
    public interface IRoleClient
    {
        /// <summary>
        /// Retrieves role connections for the provided parties.
        /// </summary>
        /// <param name="party">The party performing the lookup.</param>
        /// <param name="to">Optional right holder filter.</param>
        /// <param name="from">Optional right owner filter.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<PaginatedResult<RolePermission>> GetRoleConnections(Guid party, Guid? to, Guid? from, string languageCode);

        /// <summary>
        /// Retrieves metadata for a package by id.
        /// </summary>
        /// <param name="roleId">The role identifier.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<RoleMetadata> GetRoleById(Guid roleId, string languageCode);

        /// <summary>
        /// Revokes a role connection from a right holder.
        /// </summary>
        /// <param name="party">The party performing the revocation.</param>
        /// <param name="from">The right owner that granted the role.</param>
        /// <param name="to">The right holder receiving the role.</param>
        /// <param name="roleId">The role to revoke.</param>
        Task RevokeRole(Guid party, Guid from, Guid to, Guid roleId);
    }
}
