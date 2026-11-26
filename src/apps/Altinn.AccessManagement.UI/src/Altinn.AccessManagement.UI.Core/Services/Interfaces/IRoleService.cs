using System.Collections.Generic;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage.Frontend;
using Altinn.AccessManagement.UI.Core.Models.ResourceRegistry.Frontend;
using Altinn.AccessManagement.UI.Core.Models.Role.Frontend;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Core.Services.Interfaces
{
    /// <summary>
    /// Service for access package logic
    /// </summary>
    public interface IRoleService
    {
        /// <summary>
        /// Gets permissions for the given parties.
        /// </summary>
        /// <param name="party">The party performing the lookup.</param>
        /// <param name="from">Optional right owner filter.</param>
        /// <param name="to">Optional right holder filter.</param>
        /// <param name="languageCode">Language code for localization.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<List<RolePermissionFE>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets metadata for all roles.
        /// </summary>
        /// <param name="languageCode">Language code for localization.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<IEnumerable<RoleMetadata>> GetAllRoles(string languageCode, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets package metadata for a role.
        /// </summary>
        /// <param name="roleCode">The role code.</param>
        /// <param name="variant">Optional variant filter.</param>
        /// <param name="includeResources">Whether to include resources for each package.</param>
        /// <param name="languageCode">Language code for localization.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<IEnumerable<AccessPackageFE>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets resource metadata for a role.
        /// </summary>
        /// <param name="roleCode">The role code.</param>
        /// <param name="variant">Optional variant filter.</param>
        /// <param name="includePackageResources">Whether to include resources assigned via packages.</param>
        /// <param name="languageCode">Language code for localization.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task<IEnumerable<ServiceResourceFE>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode, CancellationToken cancellationToken = default);

        /// <summary>
        /// Removes an Altinn 2 role assignment between two parties.
        /// </summary>
        /// <param name="party">The party performing the action.</param>
        /// <param name="from">The right owner (the party that has the role).</param>
        /// <param name="to">The right holder (the party the role is assigned to).</param>
        /// <param name="roleCode">The role code to remove.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        Task RemoveRole(Guid party, Guid from, Guid to, string roleCode, CancellationToken cancellationToken = default);
    }
}
