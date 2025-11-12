using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
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
        /// Gets package metadata for a role.
        /// </summary>
        /// <param name="roleId">The role identifier.</param>
        /// <param name="variant">Optional variant filter.</param>
        /// <param name="includeResources">Whether to include resources for each package.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<IEnumerable<AccessPackage>> GetRolePackages(Guid roleId, string variant, bool includeResources, string languageCode);

        /// <summary>
        /// Gets resource metadata for a role.
        /// </summary>
        /// <param name="roleId">The role identifier.</param>
        /// <param name="variant">Optional variant filter.</param>
        /// <param name="includePackageResources">Whether to include resources assigned via packages.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<IEnumerable<ResourceAM>> GetRoleResources(Guid roleId, string variant, bool includePackageResources, string languageCode);
    }
}
