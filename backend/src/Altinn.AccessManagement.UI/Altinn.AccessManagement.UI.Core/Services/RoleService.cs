using System.Collections.Generic;
using System.Linq;
using Altinn.AccessManagement.UI.Core.ClientInterfaces;
using Altinn.AccessManagement.UI.Core.Models.AccessPackage;
using Altinn.AccessManagement.UI.Core.Models.Role;
using Altinn.AccessManagement.UI.Core.Services.Interfaces;
using RoleMetadata = Altinn.AccessManagement.UI.Core.Models.Common.Role;

namespace Altinn.AccessManagement.UI.Core.Services
{
    /// <inheritdoc />
    public class RoleService : IRoleService
    {
        private readonly IRoleClient _roleClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="RoleService"/> class.
        /// </summary>
        /// <param name="roleClient">The role client.</param>
        public RoleService(IRoleClient roleClient)
        {
            _roleClient = roleClient;
        }

        /// <inheritdoc />
        public async Task<List<RolePermission>> GetRolePermissions(Guid party, Guid? from, Guid? to, string languageCode)
        {
            var paginated = await _roleClient.GetRolePermissions(party, from, to, languageCode);
            return paginated?.Items?.ToList() ?? new List<RolePermission>();
        }

        /// <inheritdoc />
        public Task<RoleMetadata> GetRoleById(Guid roleId, string languageCode) => _roleClient.GetRoleById(roleId, languageCode);

        /// <inheritdoc />
        public Task<IEnumerable<AccessPackage>> GetRolePackages(string roleCode, string variant, bool includeResources, string languageCode)
            => _roleClient.GetRolePackages(roleCode, variant, includeResources, languageCode);

        /// <inheritdoc />
        public Task<IEnumerable<ResourceAM>> GetRoleResources(string roleCode, string variant, bool includePackageResources, string languageCode)
            => _roleClient.GetRoleResources(roleCode, variant, includePackageResources, languageCode);
    }
}
