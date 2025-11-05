using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.Role;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
        /// <summary>
        /// Service for access package logic
        /// </summary>
        public interface IRoleService
        {
            /// <summary>
            /// Gets role connections for the given parties.
            /// </summary>
            /// <param name="party">The party performing the lookup.</param>
            /// <param name="from">Optional right owner filter.</param>
            /// <param name="to">Optional right holder filter.</param>
            /// <param name="languageCode">Language code for localization.</param>
            Task<List<RolePermission>> GetConnections(Guid party, Guid? from, Guid? to, string languageCode);

            /// <summary>
            /// Gets role metadata by id.
            /// </summary>
            /// <param name="roleId">The role identifier.</param>
            /// <param name="languageCode">Language code for localization.</param>
            Task<RoleMetadata> GetRoleById(Guid roleId, string languageCode);

            /// <summary>
            /// Revokes a role connection for a right holder.
            /// </summary>
            /// <param name="from">The right owner that delegated the role.</param>
            /// <param name="to">The right holder that received the role.</param>
            /// <param name="party">The party performing the action.</param>
            /// <param name="roleId">The role identifier.</param>
            Task RevokeRole(Guid from, Guid to, Guid party, Guid roleId);
    }
}
