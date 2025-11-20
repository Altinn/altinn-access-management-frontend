using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
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
        /// Retrieves permissions for the provided parties.
        /// </summary>
        /// <param name="party">The party performing the lookup.</param>
        /// <param name="from">Optional right owner filter.</param>
        /// <param name="to">Optional right holder filter.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<PaginatedResult<RolePermission>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode);

        /// <summary>
        /// Retrieves metadata for a package by id.
        /// </summary>
        /// <param name="roleId">The role identifier.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<RoleMetadata> GetRoleById(Guid roleId, string languageCode);

        /// <summary>
        /// Retrieves metadata for all roles.
        /// </summary>
        /// <param name="languageCode">Language code for localization.</param>
        Task<IEnumerable<RoleMetadata>> GetAllRoles(string languageCode);

        /// <summary>
        /// Retrieves package metadata for a given role.
        /// </summary>
        /// <param name="roleCode">The role code.</param>
        /// <param name="variant">Optional variant filter.</param>
        /// <param name="includeResources">Whether package resources should be included.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<IEnumerable<AccessPackage>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode);

        /// <summary>
        /// Retrieves resource metadata for a given role.
        /// </summary>
        /// <param name="roleCode">The role code.</param>
        /// <param name="variant">Optional variant filter.</param>
        /// <param name="includePackageResources">Whether resources from packages should be included.</param>
        /// <param name="languageCode">Language code for localization.</param>
        Task<IEnumerable<ResourceAM>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode);
    }
}
